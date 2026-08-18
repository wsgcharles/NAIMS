using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Enums;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class AccountingService : IAccountingService
{
    private readonly EduCoreDbContext _context;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly IAuditLogService _auditLogService;

    public AccountingService(EduCoreDbContext context, IEmailService emailService, INotificationService notificationService, IAuditLogService auditLogService)
    {
        _context = context;
        _emailService = emailService;
        _notificationService = notificationService;
        _auditLogService = auditLogService;
    }

    #region School Fees Catalog

    public async Task<List<SchoolFeeResponse>> GetSchoolFeesAsync(int? academicYearId, int? gradeLevelId)
    {
        var query = _context.SchoolFees
            .Include(x => x.AcademicYear)
            .Include(x => x.GradeLevel)
            .Where(x => !x.IsDeleted)
            .AsQueryable();

        if (academicYearId.HasValue)
            query = query.Where(x => x.AcademicYearId == academicYearId.Value);

        if (gradeLevelId.HasValue)
            query = query.Where(x => x.GradeLevelId == null || x.GradeLevelId == gradeLevelId.Value);

        var fees = await query
            .OrderBy(x => x.FeeName)
            .ToListAsync();
        return fees.Select(MapToFeeResponse).ToList();
    }


    public async Task<SchoolFeeResponse?> GetSchoolFeeByIdAsync(int id)
    {
        var fee = await _context.SchoolFees
            .Include(x => x.AcademicYear)
            .Include(x => x.GradeLevel)
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        return fee == null ? null : MapToFeeResponse(fee);
    }

    public async Task<SchoolFeeResponse> CreateSchoolFeeAsync(CreateSchoolFeeRequest request)
    {
        var fee = new SchoolFee
        {
            FeeName = request.FeeName,
            FeeType = request.FeeType,
            Amount = request.Amount,
            AcademicYearId = request.AcademicYearId,
            GradeLevelId = request.GradeLevelId,
            IsMandatory = request.IsMandatory,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.SchoolFees.Add(fee);
        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("SchoolFee.Create", "SchoolFee", fee.Id.ToString(), $"Created fee category '{fee.FeeName}' ({fee.Amount:N2}).");

        return await GetSchoolFeeByIdAsync(fee.Id)
            ?? throw new InvalidOperationException("Failed to retrieve created school fee.");
    }

    public async Task<SchoolFeeResponse?> UpdateSchoolFeeAsync(int id, UpdateSchoolFeeRequest request)
    {
        var fee = await _context.SchoolFees.FindAsync(id);
        if (fee == null) return null;

        fee.FeeName = request.FeeName;
        fee.FeeType = request.FeeType;
        fee.Amount = request.Amount;
        fee.AcademicYearId = request.AcademicYearId;
        fee.GradeLevelId = request.GradeLevelId;
        fee.IsMandatory = request.IsMandatory;
        fee.IsActive = request.IsActive;
        fee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("SchoolFee.Update", "SchoolFee", fee.Id.ToString(), $"Updated fee category '{fee.FeeName}'.");

        return await GetSchoolFeeByIdAsync(id);
    }

    public async Task<bool> DeleteSchoolFeeAsync(int id)
    {
        var fee = await _context.SchoolFees.FindAsync(id);
        if (fee == null) return false;

        fee.IsDeleted = true;
        fee.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("SchoolFee.Delete", "SchoolFee", id.ToString(), $"Deleted fee category '{fee.FeeName}'.");

        return true;
    }

    #endregion

    #region Bill Generation & Management

    public async Task<StudentBillResponse> GenerateBillForEnrollmentAsync(int enrollmentId, int? createdByUserId = null)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Section)
                .ThenInclude(s => s!.ProgramOffering)
            .FirstOrDefaultAsync(e => e.Id == enrollmentId)
            ?? throw new InvalidOperationException("Enrollment record not found.");

        // Check if bill already exists for this enrollment
        var existingBill = await _context.StudentBills
            .FirstOrDefaultAsync(b => b.EnrollmentId == enrollmentId);

        if (existingBill != null)
        {
            return await GetBillByIdAsync(existingBill.Id)
                ?? throw new InvalidOperationException("Failed to load existing bill.");
        }

        int gradeLevelId = enrollment.Section?.ProgramOffering?.GradeLevelId ?? 0;
        int academicYearId = enrollment.Section?.ProgramOffering?.AcademicYearId ?? enrollment.AcademicYearId;

        if (gradeLevelId == 0 && enrollment.SectionId.HasValue)
        {
            var sec = await _context.Sections.Include(s => s.ProgramOffering).FirstOrDefaultAsync(s => s.Id == enrollment.SectionId.Value);
            if (sec?.ProgramOffering != null)
            {
                gradeLevelId = sec.ProgramOffering.GradeLevelId;
                academicYearId = sec.ProgramOffering.AcademicYearId;
            }
        }

        // Fetch applicable fees
        var applicableFees = await _context.SchoolFees
            .Where(f => f.IsActive && f.AcademicYearId == academicYearId &&
                       (f.GradeLevelId == null || f.GradeLevelId == gradeLevelId))
            .ToListAsync();

        var settings = await _context.SchoolSettings.FirstOrDefaultAsync();
        var billPrefix = settings?.BillNumberPrefix ?? "BILL-";
        var nextCount = await _context.StudentBills.CountAsync() + 1;
        var billNumber = $"{billPrefix}{DateTime.UtcNow.Year}-{nextCount:D6}";

        var bill = new StudentBill
        {
            BillNumber = billNumber,
            EnrollmentId = enrollmentId,
            DueDate = DateTime.UtcNow.AddDays(30),
            Status = BillStatus.Pending,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow
        };

        decimal totalAmount = 0;
        foreach (var fee in applicableFees)
        {
            bill.BillItems.Add(new StudentBillItem
            {
                SchoolFeeId = fee.Id,
                FeeName = fee.FeeName,
                Amount = fee.Amount,
                DiscountAmount = 0,
                CreatedAt = DateTime.UtcNow
            });
            totalAmount += fee.Amount;
        }

        bill.SubTotal = totalAmount;
        bill.TotalAmount = totalAmount;

        _context.StudentBills.Add(bill);
        await _context.SaveChangesAsync();

        return await GetBillByIdAsync(bill.Id)
            ?? throw new InvalidOperationException("Failed to retrieve generated bill.");
    }

    public async Task<StudentBillResponse?> GetBillByIdAsync(int id)
    {
        var bill = await _context.StudentBills
            .Include(b => b.Enrollment)
                .ThenInclude(e => e!.Student)
            .Include(b => b.Enrollment)
                .ThenInclude(e => e!.Section)
                    .ThenInclude(s => s!.ProgramOffering)
                        .ThenInclude(po => po!.GradeLevel)
            .Include(b => b.BillItems)
            .Include(b => b.Payments)
                .ThenInclude(p => p.OfficialReceipt)
            .Include(b => b.Payments)
                .ThenInclude(p => p.ProcessedBy)
            .FirstOrDefaultAsync(b => b.Id == id);

        return bill == null ? null : MapToBillResponse(bill);
    }

    public async Task<List<StudentBillResponse>> GetBillsByStudentIdAsync(int studentId)
    {
        var bills = await _context.StudentBills
            .Include(b => b.Enrollment)
                .ThenInclude(e => e!.Student)
            .Include(b => b.Enrollment)
                .ThenInclude(e => e!.Section)
                    .ThenInclude(s => s!.ProgramOffering)
                        .ThenInclude(po => po!.GradeLevel)
            .Include(b => b.BillItems)
            .Include(b => b.Payments)
                .ThenInclude(p => p.OfficialReceipt)
            .Include(b => b.Payments)
                .ThenInclude(p => p.ProcessedBy)
            .Where(b => b.EnrollmentId != null && b.Enrollment!.StudentId == studentId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return bills.Select(MapToBillResponse).ToList();
    }

    #endregion

    #region Queue & Application Assessment

    public async Task<List<AccountingQueueItemDto>> GetAccountingQueueAsync(string? stage = null)
    {
        var applications = await _context.EnrollmentApplications
            .Where(a => a.HasRegistrarVerificationSlip || a.Status == EnrollmentApplicationStatus.Approved || a.Status == EnrollmentApplicationStatus.AccountingAssessment || a.Status == EnrollmentApplicationStatus.PaymentConfirmed)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        var activeSy = await _context.AcademicYears.Where(sy => sy.Status == AcademicYearStatus.Current).Select(sy => sy.SchoolYear).FirstOrDefaultAsync() ?? "2026-2027";

        var appIds = applications.Select(a => a.Id).ToList();
        var bills = await _context.StudentBills
            .Where(b => b.EnrollmentApplicationId.HasValue && appIds.Contains(b.EnrollmentApplicationId.Value))
            .Include(b => b.Payments)
            .ToListAsync();

        var result = new List<AccountingQueueItemDto>();

        foreach (var app in applications)
        {
            var bill = bills.FirstOrDefault(b => b.EnrollmentApplicationId == app.Id);
            var queueStage = "ReadyForAssessment";
            if (bill != null)
            {
                if (bill.Balance <= 0 || app.Status == EnrollmentApplicationStatus.PaymentConfirmed || bill.FinancialClearanceStatus == "Cleared")
                {
                    queueStage = "Paid";
                }
                else
                {
                    queueStage = "AssessmentInProgress";
                }
            }

            if (!string.IsNullOrEmpty(stage) && !string.Equals(stage, "All", StringComparison.OrdinalIgnoreCase))
            {
                if (!string.Equals(queueStage, stage, StringComparison.OrdinalIgnoreCase))
                    continue;
            }

            result.Add(new AccountingQueueItemDto
            {
                ApplicationId = app.Id,
                ApplicationNumber = app.ApplicationNumber,
                ApplicantName = $"{app.FirstName} {app.LastName}",
                GradeApplyingFor = app.GradeApplyingFor,
                SchoolYear = activeSy,
                VerificationSlipNumber = app.VerificationSlipNumber ?? "SLIP-NOT-ISSUED",
                DateVerified = app.VerificationSlipGeneratedAt,
                AssignedRegistrar = "Registrar Office",
                Status = app.Status.ToString(),
                QueueStage = queueStage,
                FinancialClearanceStatus = bill?.FinancialClearanceStatus ?? "Pending",
                BillId = bill?.Id,
                TotalBilled = bill?.TotalAmount ?? 0,
                TotalPaid = bill?.AmountPaid ?? 0,
                RemainingBalance = bill?.Balance ?? 0
            });
        }

        return result;
    }

    public async Task<StudentBillResponse> GenerateAssessmentForApplicationAsync(GenerateAssessmentRequest request, int? createdByUserId = null)
    {
        var app = await _context.EnrollmentApplications.FindAsync(request.ApplicationId)
            ?? throw new InvalidOperationException($"Application #{request.ApplicationId} not found.");

        if (!app.HasRegistrarVerificationSlip)
        {
            throw new InvalidOperationException("Registrar Verification Slip must be generated before Accounting Assessment.");
        }

        var existingBill = await _context.StudentBills
            .Include(b => b.BillItems)
            .Include(b => b.Payments)
            .FirstOrDefaultAsync(b => b.EnrollmentApplicationId == app.Id);

        var settings = await _context.SchoolSettings.FirstOrDefaultAsync();
        var billPrefix = settings?.BillNumberPrefix ?? "BILL-";

        if (existingBill == null)
        {
            var billCount = await _context.StudentBills.CountAsync() + 1;
            var billNumber = $"{billPrefix}{DateTime.UtcNow.Year}-{billCount:D6}";

            var bill = new StudentBill
            {
                BillNumber = billNumber,
                EnrollmentApplicationId = app.Id,
                SubTotal = request.TuitionFee + request.MiscellaneousFee + request.LaboratoryFee + request.BooksFee,
                DiscountAmount = request.VoucherAmount + request.DiscountAmount,
                DiscountRemarks = request.DiscountRemarks,
                TotalAmount = (request.TuitionFee + request.MiscellaneousFee + request.LaboratoryFee + request.BooksFee) - (request.VoucherAmount + request.DiscountAmount),
                AmountPaid = 0,
                Status = BillStatus.Pending,
                FinancialClearanceStatus = "Pending",
                DueDate = request.DueDate ?? DateTime.UtcNow.AddDays(30),
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = createdByUserId
            };

            if (request.TuitionFee > 0)
                bill.BillItems.Add(new StudentBillItem { FeeName = "Tuition Fee", Amount = request.TuitionFee });
            if (request.MiscellaneousFee > 0)
                bill.BillItems.Add(new StudentBillItem { FeeName = "Miscellaneous Fees", Amount = request.MiscellaneousFee });
            if (request.LaboratoryFee > 0)
                bill.BillItems.Add(new StudentBillItem { FeeName = "Laboratory Fees", Amount = request.LaboratoryFee });
            if (request.BooksFee > 0)
                bill.BillItems.Add(new StudentBillItem { FeeName = "Books & Learning Materials", Amount = request.BooksFee });
            if (request.VoucherAmount > 0)
                bill.BillItems.Add(new StudentBillItem { FeeName = "ESC / QVR Voucher", Amount = -request.VoucherAmount });
            if (request.DiscountAmount > 0)
                bill.BillItems.Add(new StudentBillItem { FeeName = "Tuition Discount", Amount = -request.DiscountAmount, Notes = request.DiscountRemarks });

            _context.StudentBills.Add(bill);
            app.Status = EnrollmentApplicationStatus.AccountingAssessment;
            app.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync("AssessmentGenerated", "EnrollmentApplication", app.Id.ToString(), $"Generated financial assessment bill {billNumber} for applicant {app.FirstName} {app.LastName} (Total: ₱{bill.TotalAmount:N2}).");

            return MapToBillResponse(bill);
        }
        else
        {
            existingBill.SubTotal = request.TuitionFee + request.MiscellaneousFee + request.LaboratoryFee + request.BooksFee;
            existingBill.DiscountAmount = request.VoucherAmount + request.DiscountAmount;
            existingBill.DiscountRemarks = request.DiscountRemarks;
            existingBill.TotalAmount = existingBill.SubTotal - existingBill.DiscountAmount;
            existingBill.UpdatedAt = DateTime.UtcNow;

            app.Status = EnrollmentApplicationStatus.AccountingAssessment;
            app.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync("AssessmentEdited", "StudentBill", existingBill.Id.ToString(), $"Edited assessment bill {existingBill.BillNumber} for applicant {app.FirstName} {app.LastName}.");

            return MapToBillResponse(existingBill);
        }
    }

    public async Task<StudentLedgerResponse> GetApplicationFinancialAccountAsync(int applicationId)
    {
        var app = await _context.EnrollmentApplications.FindAsync(applicationId)
            ?? throw new InvalidOperationException("Application not found.");

        var bill = await _context.StudentBills
            .Include(b => b.BillItems)
            .Include(b => b.Payments)
                .ThenInclude(p => p.OfficialReceipt)
            .FirstOrDefaultAsync(b => b.EnrollmentApplicationId == applicationId);

        var transactions = new List<LedgerTransactionDto>();
        decimal runningBalance = 0;

        if (bill != null)
        {
            runningBalance += bill.TotalAmount;
            transactions.Add(new LedgerTransactionDto
            {
                Date = bill.CreatedAt,
                ReferenceNo = bill.BillNumber,
                Type = "Debit",
                Description = "Assessment Bill",
                Debit = bill.TotalAmount,
                Credit = 0,
                RunningBalance = runningBalance
            });

            foreach (var p in bill.Payments.OrderBy(p => p.PaymentDate))
            {
                runningBalance -= p.Amount;
                transactions.Add(new LedgerTransactionDto
                {
                    Date = p.PaymentDate,
                    ReferenceNo = p.OfficialReceipt?.ReceiptNumber ?? p.PaymentNumber,
                    Type = "Credit",
                    Description = $"Payment via {p.PaymentMethod} {(string.IsNullOrEmpty(p.ReferenceNumber) ? "" : $"Ref: {p.ReferenceNumber}")}",
                    Debit = 0,
                    Credit = p.Amount,
                    RunningBalance = runningBalance
                });
            }
        }

        return new StudentLedgerResponse
        {
            StudentId = 0,
            StudentNumber = app.ApplicationNumber,
            FullName = $"{app.FirstName} {app.LastName} (Applicant)",
            GradeLevelName = app.GradeApplyingFor,
            TotalBilled = bill?.TotalAmount ?? 0,
            TotalPaid = bill?.AmountPaid ?? 0,
            CurrentBalance = bill?.Balance ?? 0,
            Transactions = transactions
        };
    }

    public async Task<PaymentResponse> AdjustPaymentAsync(PaymentAdjustmentRequest request)
    {
        var payment = await _context.Payments
            .Include(p => p.StudentBill)
            .Include(p => p.OfficialReceipt)
            .FirstOrDefaultAsync(p => p.Id == request.PaymentId)
            ?? throw new InvalidOperationException("Payment record not found.");

        var oldAmount = payment.Amount;
        var diff = request.NewAmount - oldAmount;

        payment.Amount = request.NewAmount;
        payment.Remarks = $"Adjusted from {oldAmount:N2} to {request.NewAmount:N2}. Reason: {request.Reason}";
        payment.UpdatedAt = DateTime.UtcNow;

        if (payment.StudentBill != null)
        {
            payment.StudentBill.AmountPaid += diff;
            if (payment.StudentBill.Balance <= 0)
                payment.StudentBill.Status = BillStatus.Paid;
            else
                payment.StudentBill.Status = BillStatus.PartiallyPaid;
        }

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("PaymentAdjusted", "Payment", payment.Id.ToString(), $"Adjusted payment #{payment.PaymentNumber} from ₱{oldAmount:N2} to ₱{request.NewAmount:N2}. Reason: {request.Reason}");

        return MapToPaymentResponse(payment);
    }

    #endregion

    #region Payment Processing & Receipts

    public async Task<PaymentResponse> ProcessPaymentAsync(ProcessPaymentRequest request)
    {
        // Validate payment amount before any DB access
        if (request.Amount <= 0)
            throw new InvalidOperationException("Payment amount must be greater than zero.");

        var bill = await _context.StudentBills
            .Include(b => b.Enrollment)
                .ThenInclude(e => e!.Student)
            .Include(b => b.EnrollmentApplication)
            .FirstOrDefaultAsync(b => b.Id == request.StudentBillId)
            ?? throw new InvalidOperationException("Student bill not found.");

        if (bill.Balance <= 0)
            throw new InvalidOperationException("This bill is already fully paid.");

        if (request.Amount > bill.Balance)
            throw new InvalidOperationException($"Payment amount ({request.Amount:N2}) exceeds remaining balance ({bill.Balance:N2}).");

        var employee = await _context.Employees.FindAsync(request.ProcessedByEmployeeId)
            ?? throw new InvalidOperationException("Processing employee not found.");

        var settings = await _context.SchoolSettings.FirstOrDefaultAsync();
        var payPrefix = settings?.PaymentNumberPrefix ?? "PAY-";
        var orPrefix = settings?.OfficialReceiptPrefix ?? "OR-";

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Use MAX(Id) after insert for receipt number to leverage PostgreSQL's unique auto-increment PK.
            // COUNT()+1 is unsafe under concurrency — two simultaneous requests can read the same count.
            var payMaxId = await _context.Payments.MaxAsync(p => (int?)p.Id) ?? 0;
            var paymentNumber = $"{payPrefix}{DateTime.UtcNow.Year}-{(payMaxId + 1):D6}";

            var payment = new Payment
            {
                PaymentNumber = paymentNumber,
                StudentBillId = bill.Id,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                ReferenceNumber = request.ReferenceNumber,
                Remarks = request.Remarks,
                Status = PaymentStatus.Completed,
                PaymentDate = DateTime.UtcNow,
                ProcessedByEmployeeId = request.ProcessedByEmployeeId,
                ProcessedByUserId = request.ProcessedByUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Use the actual inserted Payment.Id (PK) as the receipt sequence basis.
            // After SaveChangesAsync, payment.Id is guaranteed unique by PostgreSQL sequence.
            var receiptNumber = $"{orPrefix}{DateTime.UtcNow.Year}-{payment.Id:D6}";

            var payerName = bill.Enrollment?.Student != null
                ? $"{bill.Enrollment.Student.FirstName} {bill.Enrollment.Student.LastName}"
                : bill.EnrollmentApplication != null
                    ? $"{bill.EnrollmentApplication.FirstName} {bill.EnrollmentApplication.LastName}"
                    : "Applicant";

            var receipt = new OfficialReceipt
            {
                PaymentId = payment.Id,
                ReceiptNumber = receiptNumber,
                TotalAmountPaid = request.Amount,
                PayerName = payerName,
                IssuedAt = DateTime.UtcNow,
                IssuedByEmployeeId = request.ProcessedByEmployeeId,
                CreatedAt = DateTime.UtcNow
            };

            _context.OfficialReceipts.Add(receipt);

            // Update Bill Balances & Status
            bill.AmountPaid += request.Amount;
            if (bill.Balance <= 0)
            {
                bill.Status = BillStatus.Paid;
                bill.FinancialClearanceStatus = "Cleared";
            }
            else
            {
                bill.Status = BillStatus.PartiallyPaid;
                bill.FinancialClearanceStatus = "InstallmentApproved";
            }

            // If this is an application bill, update application status to PaymentConfirmed & notify Registrar
            if (bill.EnrollmentApplication != null)
            {
                bill.EnrollmentApplication.Status = EnrollmentApplicationStatus.PaymentConfirmed;
                bill.EnrollmentApplication.UpdatedAt = DateTime.UtcNow;

                await _notificationService.CreateAsync(new CreateNotificationRequest
                {
                    TargetRole = "Registrar",
                    Title = "Payment Complete - Ready for Section Assignment",
                    Message = $"Payment complete for applicant {bill.EnrollmentApplication.FirstName} {bill.EnrollmentApplication.LastName} ({bill.EnrollmentApplication.ApplicationNumber}). Ready for section assignment.",
                    Type = "Info"
                });
            }

            bill.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            if (bill.Enrollment?.Student?.UserId != null)
            {
                await _notificationService.NotifyUserAsync(
                    bill.Enrollment.Student.UserId.Value,
                    "Payment Received",
                    $"We received your payment of {request.Amount:N2} for bill {bill.BillNumber}. Receipt #{receiptNumber}.",
                    "Success");
            }

            await _auditLogService.LogAsync("Payment.Process", "Payment", payment.Id.ToString(), $"Processed payment of {request.Amount:N2} for bill {bill.BillNumber} (Receipt #{receiptNumber}).");

            var studentEmail = bill.Enrollment?.Student?.Email ?? bill.EnrollmentApplication?.Email;
            if (!string.IsNullOrEmpty(studentEmail))
            {
                await _emailService.QueueEmailAsync(
                    studentEmail,
                    $"Noah's Academy - Official Receipt #{receiptNumber}",
                    "PaymentReceipt",
                    new PaymentReceiptEmailViewModel
                    {
                        PayerName = receipt.PayerName,
                        StudentName = payerName,
                        ReceiptNumber = receiptNumber,
                        AmountPaid = request.Amount,
                        RemainingBalance = bill.Balance,
                        PaymentDate = payment.PaymentDate
                    });
            }

            return await GetPaymentByIdAsync(payment.Id)
                ?? throw new InvalidOperationException("Failed to load processed payment details.");
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<PaymentResponse?> GetPaymentByIdAsync(int id)
    {
        var payment = await _context.Payments
            .Include(p => p.StudentBill)
            .Include(p => p.ProcessedBy)
            .Include(p => p.OfficialReceipt)
                .ThenInclude(r => r!.IssuedBy)
            .FirstOrDefaultAsync(p => p.Id == id);

        return payment == null ? null : MapToPaymentResponse(payment);
    }

    public async Task<List<PaymentResponse>> GetPaymentsByStudentIdAsync(int studentId)
    {
        var payments = await _context.Payments
            .Include(p => p.StudentBill)
                .ThenInclude(b => b.Enrollment)
            .Include(p => p.ProcessedBy)
            .Include(p => p.OfficialReceipt)
                .ThenInclude(r => r!.IssuedBy)
            .Where(p => p.StudentBill.EnrollmentId != null && p.StudentBill.Enrollment!.StudentId == studentId)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync();

        return payments.Select(MapToPaymentResponse).ToList();
    }

    public async Task<OfficialReceiptResponse?> GetReceiptByPaymentIdAsync(int paymentId)
    {
        var receipt = await _context.OfficialReceipts
            .Include(r => r.IssuedBy)
            .FirstOrDefaultAsync(r => r.PaymentId == paymentId);

        return receipt == null ? null : MapToReceiptResponse(receipt);
    }

    public async Task<List<OfficialReceiptResponse>> GetReceiptsByStudentIdAsync(int studentId)
    {
        var receipts = await _context.OfficialReceipts
            .Include(r => r.IssuedBy)
            .Include(r => r.Payment)
                .ThenInclude(p => p.StudentBill)
                    .ThenInclude(b => b.Enrollment)
            .Where(r => r.Payment.StudentBill.EnrollmentId != null && r.Payment.StudentBill.Enrollment!.StudentId == studentId)
            .OrderByDescending(r => r.IssuedAt)
            .ToListAsync();

        return receipts.Select(MapToReceiptResponse).ToList();
    }

    #endregion

    #region Ledger & Dashboard

    public async Task<StudentLedgerResponse> GetStudentLedgerAsync(int studentId)
    {
        var student = await _context.Students
            .Include(s => s.Enrollments)
                .ThenInclude(e => e.Section)
                    .ThenInclude(sec => sec!.ProgramOffering)
                        .ThenInclude(po => po.GradeLevel)
            .FirstOrDefaultAsync(s => s.Id == studentId)
            ?? throw new InvalidOperationException("Student not found.");

        var bills = await GetBillsByStudentIdAsync(studentId);

        var ledger = new StudentLedgerResponse
        {
            StudentId = student.Id,
            StudentNumber = student.StudentNumber,
            FullName = $"{student.FirstName} {student.LastName}",
            GradeLevelName = student.Enrollments.LastOrDefault()?.Section?.ProgramOffering?.GradeLevel?.Name ?? "N/A",
            TotalBilled = bills.Sum(b => b.TotalAmount),
            TotalPaid = bills.Sum(b => b.AmountPaid),
            CurrentBalance = bills.Sum(b => b.Balance)
        };

        decimal runningBalance = 0;
        var transactions = new List<LedgerTransactionDto>();

        foreach (var bill in bills.OrderBy(b => b.CreatedAt))
        {
            runningBalance += bill.TotalAmount;
            transactions.Add(new LedgerTransactionDto
            {
                Date = bill.CreatedAt,
                ReferenceNo = bill.BillNumber,
                Type = "Bill",
                Description = $"Billing Statement for {bill.GradeLevelName}",
                Debit = bill.TotalAmount,
                Credit = 0,
                RunningBalance = runningBalance
            });

            foreach (var pay in bill.Payments.OrderBy(p => p.PaymentDate))
            {
                runningBalance -= pay.Amount;
                transactions.Add(new LedgerTransactionDto
                {
                    Date = pay.PaymentDate,
                    ReferenceNo = pay.Receipt?.ReceiptNumber ?? pay.PaymentNumber,
                    Type = "Payment",
                    Description = $"Payment via {pay.PaymentMethod} (Ref: {pay.ReferenceNumber ?? "N/A"})",
                    Debit = 0,
                    Credit = pay.Amount,
                    RunningBalance = runningBalance
                });
            }
        }

        ledger.Transactions = transactions.OrderBy(t => t.Date).ToList();
        return ledger;
    }

    public async Task<AccountingDashboardResponse> GetAccountingDashboardAsync()
    {
        var today = DateTime.UtcNow.Date;
        var firstDayOfMonth = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var todayCollection = await _context.Payments
            .Where(p => p.PaymentDate >= today && p.Status == PaymentStatus.Completed)
            .SumAsync(p => p.Amount);

        var monthlyCollection = await _context.Payments
            .Where(p => p.PaymentDate >= firstDayOfMonth && p.Status == PaymentStatus.Completed)
            .SumAsync(p => p.Amount);

        var totalOutstandingBalances = await _context.StudentBills
            .SumAsync(b => b.TotalAmount - b.AmountPaid);

        var paidStudentsCount = await _context.StudentBills
            .Where(b => b.Status == BillStatus.Paid && b.EnrollmentId != null)
            .Select(b => b.Enrollment!.StudentId)
            .Distinct()
            .CountAsync();

        var unpaidStudentsCount = await _context.StudentBills
            .Where(b => (b.Status == BillStatus.Pending || b.Status == BillStatus.PartiallyPaid) && b.EnrollmentId != null)
            .Select(b => b.Enrollment!.StudentId)
            .Distinct()
            .CountAsync();

        var pendingBillsCount = await _context.StudentBills
            .Where(b => b.Status == BillStatus.Pending || b.Status == BillStatus.PartiallyPaid)
            .CountAsync();

        var recentPaymentsList = await _context.Payments
            .Include(p => p.StudentBill)
            .Include(p => p.ProcessedBy)
            .Include(p => p.OfficialReceipt)
                .ThenInclude(r => r!.IssuedBy)
            .OrderByDescending(p => p.PaymentDate)
            .Take(10)
            .ToListAsync();

        var recentPayments = recentPaymentsList.Select(MapToPaymentResponse).ToList();


        return new AccountingDashboardResponse
        {
            TodayCollection = todayCollection,
            MonthlyCollection = monthlyCollection,
            TotalOutstandingBalances = totalOutstandingBalances,
            PaidStudentsCount = paidStudentsCount,
            UnpaidStudentsCount = unpaidStudentsCount,
            PendingBillsCount = pendingBillsCount,
            RecentPayments = recentPayments
        };
    }

    #endregion

    #region Private Mapping Helpers

    private static SchoolFeeResponse MapToFeeResponse(SchoolFee fee)
    {
        return new SchoolFeeResponse
        {
            Id = fee.Id,
            FeeName = fee.FeeName,
            FeeType = fee.FeeType.ToString(),
            Amount = fee.Amount,
            AcademicYearId = fee.AcademicYearId,
            AcademicYearName = fee.AcademicYear?.SchoolYear ?? string.Empty,
            GradeLevelId = fee.GradeLevelId,
            GradeLevelName = fee.GradeLevel?.Name,
            IsMandatory = fee.IsMandatory,
            IsActive = fee.IsActive
        };
    }

    private static StudentBillResponse MapToBillResponse(StudentBill bill)
    {
        return new StudentBillResponse
        {
            Id = bill.Id,
            BillNumber = bill.BillNumber,
            EnrollmentId = bill.EnrollmentId ?? 0,
            StudentNumber = bill.Enrollment?.Student?.StudentNumber ?? bill.EnrollmentApplication?.ApplicationNumber ?? string.Empty,
            StudentName = bill.Enrollment?.Student != null
                ? $"{bill.Enrollment.Student.FirstName} {bill.Enrollment.Student.LastName}"
                : bill.EnrollmentApplication != null
                    ? $"{bill.EnrollmentApplication.FirstName} {bill.EnrollmentApplication.LastName} (Applicant)"
                    : string.Empty,
            GradeLevelName = bill.Enrollment?.Section?.ProgramOffering?.GradeLevel?.Name ?? string.Empty,
            SubTotal = bill.SubTotal,
            DiscountAmount = bill.DiscountAmount,
            DiscountRemarks = bill.DiscountRemarks,
            TotalAmount = bill.TotalAmount,
            AmountPaid = bill.AmountPaid,
            Balance = bill.Balance,
            Status = bill.Status.ToString(),
            DueDate = bill.DueDate,
            CreatedAt = bill.CreatedAt,
            Items = bill.BillItems.Select(item => new StudentBillItemResponse
            {
                Id = item.Id,
                SchoolFeeId = item.SchoolFeeId,
                FeeName = item.FeeName,
                Amount = item.Amount,
                DiscountAmount = item.DiscountAmount,
                Notes = item.Notes
            }).ToList(),
            Payments = bill.Payments.Select(MapToPaymentResponse).ToList()
        };
    }

    private static PaymentResponse MapToPaymentResponse(Payment payment)
    {
        return new PaymentResponse
        {
            Id = payment.Id,
            PaymentNumber = payment.PaymentNumber,
            StudentBillId = payment.StudentBillId,
            BillNumber = payment.StudentBill?.BillNumber ?? string.Empty,
            Amount = payment.Amount,
            PaymentMethod = payment.PaymentMethod.ToString(),
            ReferenceNumber = payment.ReferenceNumber,
            Status = payment.Status.ToString(),
            Remarks = payment.Remarks,
            PaymentDate = payment.PaymentDate,
            ProcessedByEmployeeId = payment.ProcessedByEmployeeId,
            ProcessedByName = payment.ProcessedBy != null
                ? $"{payment.ProcessedBy.FirstName} {payment.ProcessedBy.LastName}"
                : string.Empty,
            Receipt = payment.OfficialReceipt == null ? null : MapToReceiptResponse(payment.OfficialReceipt)
        };
    }

    private static OfficialReceiptResponse MapToReceiptResponse(OfficialReceipt receipt)
    {
        return new OfficialReceiptResponse
        {
            Id = receipt.Id,
            PaymentId = receipt.PaymentId,
            ReceiptNumber = receipt.ReceiptNumber,
            TotalAmountPaid = receipt.TotalAmountPaid,
            PayerName = receipt.PayerName,
            IssuedAt = receipt.IssuedAt,
            IssuedByName = receipt.IssuedBy != null
                ? $"{receipt.IssuedBy.FirstName} {receipt.IssuedBy.LastName}"
                : string.Empty,
            IsCancelled = receipt.IsCancelled,
            CancellationReason = receipt.CancellationReason
        };
    }

    #endregion
}
