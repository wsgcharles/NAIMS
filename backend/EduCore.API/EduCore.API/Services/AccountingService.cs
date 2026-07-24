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

    public AccountingService(EduCoreDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    #region School Fees Catalog

    public async Task<List<SchoolFeeResponse>> GetSchoolFeesAsync(int? academicYearId, int? gradeLevelId)
    {
        var query = _context.SchoolFees
            .Include(x => x.AcademicYear)
            .Include(x => x.GradeLevel)
            .AsQueryable();

        if (academicYearId.HasValue)
            query = query.Where(x => x.AcademicYearId == academicYearId.Value);

        if (gradeLevelId.HasValue)
            query = query.Where(x => x.GradeLevelId == null || x.GradeLevelId == gradeLevelId.Value);

        return await query
            .OrderBy(x => x.FeeName)
            .Select(x => MapToFeeResponse(x))
            .ToListAsync();
    }

    public async Task<SchoolFeeResponse?> GetSchoolFeeByIdAsync(int id)
    {
        var fee = await _context.SchoolFees
            .Include(x => x.AcademicYear)
            .Include(x => x.GradeLevel)
            .FirstOrDefaultAsync(x => x.Id == id);

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
        return await GetSchoolFeeByIdAsync(id);
    }

    public async Task<bool> DeleteSchoolFeeAsync(int id)
    {
        var fee = await _context.SchoolFees.FindAsync(id);
        if (fee == null) return false;

        fee.IsDeleted = true;
        fee.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Bill Generation & Management

    public async Task<StudentBillResponse> GenerateBillForEnrollmentAsync(int enrollmentId, int? createdByUserId = null)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Section)
                .ThenInclude(s => s.ProgramOffering)
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

        var gradeLevelId = enrollment.Section.ProgramOffering.GradeLevelId;
        var academicYearId = enrollment.Section.ProgramOffering.AcademicYearId;

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
                .ThenInclude(e => e.Student)
            .Include(b => b.Enrollment)
                .ThenInclude(e => e.Section)
                    .ThenInclude(s => s.ProgramOffering)
                        .ThenInclude(po => po.GradeLevel)
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
                .ThenInclude(e => e.Student)
            .Include(b => b.Enrollment)
                .ThenInclude(e => e.Section)
                    .ThenInclude(s => s.ProgramOffering)
                        .ThenInclude(po => po.GradeLevel)
            .Include(b => b.BillItems)
            .Include(b => b.Payments)
                .ThenInclude(p => p.OfficialReceipt)
            .Include(b => b.Payments)
                .ThenInclude(p => p.ProcessedBy)
            .Where(b => b.Enrollment.StudentId == studentId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        return bills.Select(MapToBillResponse).ToList();
    }

    #endregion

    #region Payment Processing & Receipts

    public async Task<PaymentResponse> ProcessPaymentAsync(ProcessPaymentRequest request)
    {
        var bill = await _context.StudentBills
            .Include(b => b.Enrollment)
                .ThenInclude(e => e.Student)
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
            var paymentCount = await _context.Payments.CountAsync() + 1;
            var paymentNumber = $"{payPrefix}{DateTime.UtcNow.Year}-{paymentCount:D6}";

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
            await _context.SaveChangesAsync(); // Flush for payment.Id

            // Generate Official Receipt
            var receiptCount = await _context.OfficialReceipts.CountAsync() + 1;
            var receiptNumber = $"{orPrefix}{DateTime.UtcNow.Year}-{receiptCount:D6}";

            var receipt = new OfficialReceipt
            {
                PaymentId = payment.Id,
                ReceiptNumber = receiptNumber,
                TotalAmountPaid = request.Amount,
                PayerName = $"{bill.Enrollment.Student.FirstName} {bill.Enrollment.Student.LastName}",
                IssuedAt = DateTime.UtcNow,
                IssuedByEmployeeId = request.ProcessedByEmployeeId,
                CreatedAt = DateTime.UtcNow
            };

            _context.OfficialReceipts.Add(receipt);

            // Update Bill Balances & Status
            bill.AmountPaid += request.Amount;
            if (bill.Balance <= 0)
                bill.Status = BillStatus.Paid;
            else
                bill.Status = BillStatus.PartiallyPaid;

            bill.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Queue Payment Receipt Email
            await _emailService.QueueEmailAsync(
                bill.Enrollment.Student.Email,
                $"Noah's Academy - Official Receipt #{receiptNumber}",
                "PaymentReceipt",
                new PaymentReceiptEmailViewModel
                {
                    PayerName = receipt.PayerName,
                    StudentName = $"{bill.Enrollment.Student.FirstName} {bill.Enrollment.Student.LastName}",
                    ReceiptNumber = receiptNumber,
                    AmountPaid = request.Amount,
                    RemainingBalance = bill.Balance,
                    PaymentDate = payment.PaymentDate
                });

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
            .Where(p => p.StudentBill.Enrollment.StudentId == studentId)
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
            .Where(r => r.Payment.StudentBill.Enrollment.StudentId == studentId)
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
                    .ThenInclude(sec => sec.ProgramOffering)
                        .ThenInclude(po => po.GradeLevel)
            .FirstOrDefaultAsync(s => s.Id == studentId)
            ?? throw new InvalidOperationException("Student not found.");

        var bills = await GetBillsByStudentIdAsync(studentId);

        var ledger = new StudentLedgerResponse
        {
            StudentId = student.Id,
            StudentNumber = student.StudentNumber,
            FullName = $"{student.FirstName} {student.LastName}",
            GradeLevelName = student.Enrollments.LastOrDefault()?.Section.ProgramOffering.GradeLevel.Name ?? "N/A",
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
            .Where(b => b.Status == BillStatus.Paid)
            .Select(b => b.Enrollment.StudentId)
            .Distinct()
            .CountAsync();

        var unpaidStudentsCount = await _context.StudentBills
            .Where(b => b.Status == BillStatus.Pending || b.Status == BillStatus.PartiallyPaid)
            .Select(b => b.Enrollment.StudentId)
            .Distinct()
            .CountAsync();

        var pendingBillsCount = await _context.StudentBills
            .Where(b => b.Status == BillStatus.Pending || b.Status == BillStatus.PartiallyPaid)
            .CountAsync();

        var recentPayments = await _context.Payments
            .Include(p => p.StudentBill)
            .Include(p => p.ProcessedBy)
            .Include(p => p.OfficialReceipt)
                .ThenInclude(r => r!.IssuedBy)
            .OrderByDescending(p => p.PaymentDate)
            .Take(10)
            .Select(p => MapToPaymentResponse(p))
            .ToListAsync();

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
            EnrollmentId = bill.EnrollmentId,
            StudentNumber = bill.Enrollment?.Student?.StudentNumber ?? string.Empty,
            StudentName = bill.Enrollment?.Student != null
                ? $"{bill.Enrollment.Student.FirstName} {bill.Enrollment.Student.LastName}"
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
