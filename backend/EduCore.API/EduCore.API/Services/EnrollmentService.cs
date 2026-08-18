using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using EduCore.API.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class EnrollmentService : IEnrollmentService
{
    private readonly EduCoreDbContext _context;
    private readonly NumberGeneratorService _numberGenerator;
    private readonly IPasswordService _passwordService;
    private readonly IAccountingService _accountingService;
    private readonly IPasswordPolicyService _passwordPolicyService;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly IAuditLogService _auditLogService;
    private readonly IFileStorageService _fileStorageService;
    private readonly ISectionService _sectionService;

    public EnrollmentService(
        EduCoreDbContext context,
        NumberGeneratorService numberGenerator,
        IPasswordService passwordService,
        IAccountingService accountingService,
        IPasswordPolicyService passwordPolicyService,
        IEmailService emailService,
        INotificationService notificationService,
        IAuditLogService auditLogService,
        IFileStorageService fileStorageService,
        ISectionService sectionService)
    {
        _context = context;
        _numberGenerator = numberGenerator;
        _passwordService = passwordService;
        _accountingService = accountingService;
        _passwordPolicyService = passwordPolicyService;
        _emailService = emailService;
        _notificationService = notificationService;
        _auditLogService = auditLogService;
        _fileStorageService = fileStorageService;
        _sectionService = sectionService;
    }

    public async Task<EnrollmentResponse> CreateAsync(CreateEnrollmentRequest request)
    {
        var activeAy = await _context.AcademicYears.FirstOrDefaultAsync(ay => ay.Status == AcademicYearStatus.Current);
        if (activeAy != null)
        {
            if (!activeAy.IsEnrollmentOpen)
                throw new InvalidOperationException("Online admissions are currently closed. Please check the official enrollment schedule or contact the Registrar's Office.");

            var now = DateTime.UtcNow;
            if (activeAy.EnrollmentStartDate.HasValue && now < activeAy.EnrollmentStartDate.Value)
                throw new InvalidOperationException("Online admissions are currently closed. Please check the official enrollment schedule or contact the Registrar's Office.");

            if (activeAy.EnrollmentEndDate.HasValue && now > activeAy.EnrollmentEndDate.Value.AddDays(1))
                throw new InvalidOperationException("Online admissions are currently closed. Please check the official enrollment schedule or contact the Registrar's Office.");
        }

        var applicationNumber = await _numberGenerator.GenerateApplicationNumberAsync();


        var application = new EnrollmentApplication
        {
            ApplicationNumber = applicationNumber,
            FirstName = request.FirstName,
            MiddleName = request.MiddleName,
            LastName = request.LastName,
            Suffix = request.Suffix,
            BirthDate = DateTime.SpecifyKind(request.BirthDate, DateTimeKind.Utc),
            Gender = Enum.Parse<EduCore.API.Enums.Gender>(request.Gender, true),
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Address = request.Address,
            Barangay = request.Barangay,
            City = request.City,
            Province = request.Province,
            ParentName = request.ParentName,
            ParentContact = request.ParentContact,
            ParentEmail = request.ParentEmail,
            Relationship = request.Relationship,
            PreviousSchool = request.PreviousSchool,
            GradeApplyingFor = request.GradeApplyingFor,
            Track = request.Track,
            Strand = request.Strand,
            Status = EnrollmentApplicationStatus.Submitted,
            IsApproved = false,
            CreatedAt = DateTime.UtcNow
        };


        _context.EnrollmentApplications.Add(application);
        await _context.SaveChangesAsync();

        // 1. Initialize Configurable Document Checklist for this application
        var docTypes = await _context.AdmissionDocumentTypes.Where(d => d.IsActive).ToListAsync();
        var isShs = request.GradeApplyingFor.Contains("11") || request.GradeApplyingFor.Contains("12") || request.GradeApplyingFor.ToLower().Contains("senior");

        foreach (var docType in docTypes)
        {
            if (docType.ApplicableEducationLevel == "SeniorHighSchool" && !isShs)
                continue;

            _context.EnrollmentApplicationDocuments.Add(new EnrollmentApplicationDocument
            {
                EnrollmentApplicationId = application.Id,
                AdmissionDocumentTypeId = docType.Id,
                DocumentName = docType.Name,
                Status = "Missing",
                Remarks = docType.IsRequired ? "Required" : "Optional"
            });
        }

        // 2. Add Initial Status History entry
        _context.ApplicationStatusHistories.Add(new ApplicationStatusHistory
        {
            EnrollmentApplicationId = application.Id,
            FromStatus = "None",
            ToStatus = EnrollmentApplicationStatus.Submitted.ToString(),
            Remarks = "Application submitted via online portal",
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        // 3. Notify Registrar users of new application
        try
        {
            await _notificationService.CreateAsync(new CreateNotificationRequest
            {
                TargetRole = "Registrar",
                Title = "New Admission Application Received",
                Message = $"New application {applicationNumber} submitted by {request.FirstName} {request.LastName} for {request.GradeApplyingFor}.",
                Type = "Info"
            });
        }
        catch { }

        // 4. Queue automated confirmation email to applicant
        try
        {
            var bodyHtml = $@"<div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                <h2>Noah's Academy Incorporated</h2>
                <h3>Admission Application Received</h3>
                <p>Dear <strong>{request.FirstName} {request.LastName}</strong>,</p>
                <p>Thank you for applying for admission to Noah's Academy Incorporated for <strong>{request.GradeApplyingFor}</strong>.</p>
                <div style='background-color: #f4f0ff; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 16px;'>
                    <strong>Application Reference Number:</strong> {applicationNumber}
                </div>
                <p>You can track your application progress anytime at: <a href='https://portal.noahsacademy.edu.ph/admissions/track'>https://portal.noahsacademy.edu.ph/admissions/track</a></p>
                <br/>
                <p>Best regards,<br/><strong>Noah's Academy Admissions Office</strong></p>
            </div>";

            await _emailService.SendRawEmailAsync(request.Email, "Noah's Academy - Application Received", bodyHtml);
        }
        catch { }

        return MapToResponse(application);
    }

    public async Task<TrackApplicationResponse?> TrackApplicationAsync(string applicationNumber, string email)
    {
        var app = await _context.EnrollmentApplications
            .Include(a => a.Documents)
            .Include(a => a.Appointments)
            .Include(a => a.StatusHistories)
            .FirstOrDefaultAsync(a => a.ApplicationNumber.ToLower() == applicationNumber.Trim().ToLower()
                                   && a.Email.ToLower() == email.Trim().ToLower());

        if (app == null) return null;

        var statusStr = app.Status.ToString();
        var (stageIndex, stageTitle, nextStep) = GetStageDetails(app.Status);

        var latestApt = app.Appointments.OrderByDescending(a => a.CreatedAt).FirstOrDefault();
        AppointmentDto? aptDto = latestApt != null ? new AppointmentDto
        {
            Id = latestApt.Id,
            EnrollmentApplicationId = app.Id,
            ApplicationNumber = app.ApplicationNumber,
            ApplicantName = $"{app.FirstName} {app.LastName}",
            GradeApplyingFor = app.GradeApplyingFor,
            Email = app.Email,
            PhoneNumber = app.PhoneNumber,
            AppointmentDate = latestApt.AppointmentDate,
            AppointmentTime = latestApt.AppointmentTime,
            Status = latestApt.Status,
            Remarks = latestApt.Remarks,
            CreatedAt = latestApt.CreatedAt
        } : null;

        return new TrackApplicationResponse
        {
            Id = app.Id,
            ApplicationNumber = app.ApplicationNumber,
            FullName = $"{app.FirstName} {app.LastName}",
            Email = app.Email,
            GradeApplyingFor = app.GradeApplyingFor,
            Track = app.Track,
            Strand = app.Strand,
            Status = statusStr,
            StageIndex = stageIndex,
            CurrentStageTitle = stageTitle,
            EstimatedNextStep = nextStep,
            ApplicantRemarks = app.ApplicantRemarks, // Public remarks only (InternalNotes hidden!)
            CreatedAt = app.CreatedAt,
            UpdatedAt = app.UpdatedAt,
            HasRegistrarVerificationSlip = app.HasRegistrarVerificationSlip,
            VerificationSlipNumber = app.VerificationSlipNumber,
            VerificationSlipGeneratedAt = app.VerificationSlipGeneratedAt,
            Appointment = aptDto,
            Documents = app.Documents.Where(d => d.IsActive).Select(d => new ApplicationDocumentDto
            {
                Id = d.Id,
                AdmissionDocumentTypeId = d.AdmissionDocumentTypeId,
                DocumentName = d.DocumentName,
                Status = d.Status,
                DigitalStatus = d.DigitalStatus ?? (d.Status == "Verified" ? "Verified" : d.Status == "Uploaded" ? "Uploaded" : "PendingUpload"),
                OriginalStatus = d.OriginalStatus ?? "NotSubmitted",
                Remarks = d.Remarks,
                OriginalRemarks = d.OriginalRemarks,
                OriginalFilename = d.OriginalFilename,
                ContentType = d.ContentType,
                FileSize = d.FileSize,
                UploadedAt = d.UploadedAt,
                VerifiedAt = d.VerifiedAt,
                OriginalSubmittedAt = d.OriginalSubmittedAt,
                OriginalVerifiedAt = d.OriginalVerifiedAt,
                Version = d.Version,
                IsActive = d.IsActive,
                DownloadUrl = !string.IsNullOrEmpty(d.StoredFilename) ? $"/api/Enrollment/documents/{d.Id}/download" : null,
                PreviewUrl = !string.IsNullOrEmpty(d.StoredFilename) ? $"/api/Enrollment/documents/{d.Id}/preview" : null,
            }).ToList(),
            StatusHistory = app.StatusHistories
                .OrderBy(h => h.Timestamp)
                .Select(h => new StatusHistoryDto
                {
                    FromStatus = h.FromStatus,
                    ToStatus = h.ToStatus,
                    Remarks = h.Remarks,
                    Timestamp = h.Timestamp
                }).ToList()
        };
    }

    public async Task<bool> UpdateApplicationStageAsync(int applicationId, UpdateApplicationStageRequest request)
    {
        var app = await _context.EnrollmentApplications
            .Include(a => a.Documents)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (app == null) return false;

        if (!Enum.TryParse<EnrollmentApplicationStatus>(request.Status, true, out var newStatus))
            throw new InvalidOperationException($"Invalid status '{request.Status}'.");

        var oldStatus = app.Status.ToString();

        // SERVER-SIDE BUSINESS RULE: Application MUST NOT advance to Approved, AccountingAssessment, PaymentConfirmed, SectionAssignment, or Enrolled
        // until ALL required original physical documents are verified by the Registrar!
        if (newStatus == EnrollmentApplicationStatus.Approved ||
            newStatus == EnrollmentApplicationStatus.AccountingAssessment ||
            newStatus == EnrollmentApplicationStatus.PaymentConfirmed ||
            newStatus == EnrollmentApplicationStatus.SectionAssignment ||
            newStatus == EnrollmentApplicationStatus.Enrolled)
        {
            var requiredDocTypes = await _context.AdmissionDocumentTypes.Where(d => d.IsActive && d.IsRequired).Select(d => d.Id).ToListAsync();
            var activeDocs = app.Documents.Where(d => d.IsActive && d.AdmissionDocumentTypeId.HasValue && requiredDocTypes.Contains(d.AdmissionDocumentTypeId.Value)).ToList();

            var unverifiedOriginals = activeDocs.Where(d => d.OriginalStatus != "Verified").ToList();
            if (unverifiedOriginals.Any())
            {
                throw new InvalidOperationException($"Original physical document verification is required before the application can proceed to {newStatus}. Unverified original documents: {string.Join(", ", unverifiedOriginals.Select(d => d.DocumentName))}.");
            }
        }

        app.Status = newStatus;
        app.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.ApplicantRemarks))
            app.ApplicantRemarks = request.ApplicantRemarks;

        if (!string.IsNullOrWhiteSpace(request.InternalNotes))
            app.InternalNotes = request.InternalNotes;

        // Record Status History log
        _context.ApplicationStatusHistories.Add(new ApplicationStatusHistory
        {
            EnrollmentApplicationId = app.Id,
            FromStatus = oldStatus,
            ToStatus = newStatus.ToString(),
            Remarks = request.ApplicantRemarks ?? request.InternalNotes ?? $"Stage updated to {newStatus}",
            Timestamp = DateTime.UtcNow
        });

        // Update Document verification statuses if provided
        if (request.Documents != null && request.Documents.Count > 0)
        {
            foreach (var docItem in request.Documents)
            {
                var doc = app.Documents.FirstOrDefault(d => d.Id == docItem.DocumentId);
                if (doc != null)
                {
                    doc.Status = docItem.Status;
                    doc.Remarks = docItem.Remarks;
                    if (docItem.Status == "Verified") doc.VerifiedAt = DateTime.UtcNow;
                }
            }
        }

        // EARLY STUDENT RECORD CREATION AT APPROVED STAGE
        // Creates the Student entity so Accounting has a valid StudentId for billing & ledger entries
        if (newStatus == EnrollmentApplicationStatus.Approved && app.StudentId == null)
        {
            var studentNumber = await _numberGenerator.GenerateStudentNumberAsync();
            var lrnToUse = FormatLrn(null, studentNumber);
            var student = new Student
            {
                StudentNumber = studentNumber,
                LRN = lrnToUse,
                FirstName = app.FirstName,
                MiddleName = app.MiddleName,
                LastName = app.LastName,
                Suffix = app.Suffix,
                BirthDate = app.BirthDate,
                Gender = app.Gender,
                Email = app.Email,
                PhoneNumber = app.PhoneNumber,
                Address = app.Address,
                Barangay = app.Barangay,
                City = app.City,
                Province = app.Province,
                Status = StudentStatus.Inactive, // Inactive until Sectioning & Enrolled
                CreatedAt = DateTime.UtcNow
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            app.StudentId = student.Id;
            app.IsApproved = true;
        }

        await _context.SaveChangesAsync();

        // Dispatch status update email to applicant
        try
        {
            var bodyHtml = $@"<div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                <h2>Noah's Academy Incorporated</h2>
                <h3>Admission Status Update</h3>
                <p>Dear <strong>{app.FirstName} {app.LastName}</strong>,</p>
                <p>Your admission application (<strong>{app.ApplicationNumber}</strong>) status has been updated to: <strong style='color: #6b21a8;'>{newStatus}</strong>.</p>
                {(string.IsNullOrWhiteSpace(request.ApplicantRemarks) ? "" : $"<div style='background-color: #f4f0ff; padding: 12px; border-left: 4px solid #7e22ce; margin: 15px 0;'><strong>Registrar Remarks:</strong> {request.ApplicantRemarks}</div>")}
                <p>Track your full application progress at: <a href='https://portal.noahsacademy.edu.ph/admissions/track'>https://portal.noahsacademy.edu.ph/admissions/track</a></p>
                <br/><p>Noah's Academy Admissions Office</p>
            </div>";

            await _emailService.SendRawEmailAsync(app.Email, $"Noah's Academy Application Status Update - {newStatus}", bodyHtml);
        }
        catch { }

        return true;
    }

    public async Task<List<EnrollmentApplicationDto>> GetPendingSectionAssignmentQueueAsync()
    {
        var apps = await _context.EnrollmentApplications
            .AsNoTracking()
            .Include(a => a.Documents)
            .Include(a => a.Appointments)
            .Where(a => a.Status == EnrollmentApplicationStatus.PaymentConfirmed || a.Status == EnrollmentApplicationStatus.SectionAssignment)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return apps.Select(MapToApplicationDto).ToList();
    }


    public async Task<bool> AssignSectionAndEnrollAsync(int applicationId, AssignSectionAndEnrollRequest request)
    {
        var app = await _context.EnrollmentApplications
            .Include(a => a.Student)
            .Include(a => a.Documents)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (app == null) return false;

        // Idempotency: If already enrolled, return true immediately
        if (app.Status == EnrollmentApplicationStatus.Enrolled)
        {
            return true;
        }

        // AUTHENTICATED EMPLOYEE RESOLUTION & ROLE VALIDATION
        if (request.EmployeeId <= 0)
        {
            throw new InvalidOperationException("EMPLOYEE_NOT_FOUND:Authenticated registrar employee record could not be resolved.");
        }

        var performingEmployee = await _context.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId);

        if (performingEmployee == null)
        {
            throw new InvalidOperationException("EMPLOYEE_NOT_FOUND:Authenticated registrar employee record could not be resolved.");
        }

        if (!performingEmployee.IsActive)
        {
            throw new InvalidOperationException("UNAUTHORIZED_EMPLOYEE:Authenticated employee account is inactive.");
        }

        bool isAllowedRole = performingEmployee.Role == UserRole.Registrar ||
                             performingEmployee.Role == UserRole.Administrator ||
                             performingEmployee.Role == UserRole.SuperAdministrator ||
                             (performingEmployee.User != null && (
                                 performingEmployee.User.Role == UserRole.Registrar ||
                                 performingEmployee.User.Role == UserRole.Administrator ||
                                 performingEmployee.User.Role == UserRole.SuperAdministrator
                             ));

        if (!isAllowedRole)
        {
            throw new InvalidOperationException("UNAUTHORIZED_EMPLOYEE:Authenticated employee is not authorized to perform enrollment.");
        }

        // PREREQUISITE VALIDATION (Server-Side Gate Check)
        var missingRequirements = new List<string>();


        if (!app.HasRegistrarVerificationSlip)
        {
            missingRequirements.Add("Registrar Verification Slip has not been generated.");
        }

        // Verify MANDATORY physical document requirements only (Optional documents like ESC do not block enrollment)
        var mandatoryDocTypeIds = await _context.AdmissionDocumentTypes
            .Where(d => d.IsActive && d.IsRequired)
            .Select(d => d.Id)
            .ToListAsync();

        var uploadedMandatoryDocs = app.Documents
            .Where(d => d.IsActive && d.AdmissionDocumentTypeId.HasValue && mandatoryDocTypeIds.Contains(d.AdmissionDocumentTypeId.Value))
            .ToList();

        var uploadedMandatoryTypeIds = uploadedMandatoryDocs.Select(d => d.AdmissionDocumentTypeId!.Value).ToHashSet();
        var missingMandatoryTypeIds = mandatoryDocTypeIds.Where(id => !uploadedMandatoryTypeIds.Contains(id)).ToList();
        var unverifiedMandatoryDocs = uploadedMandatoryDocs.Where(d => d.OriginalStatus != "Verified").ToList();

        if (missingMandatoryTypeIds.Any() || unverifiedMandatoryDocs.Any())
        {
            missingRequirements.Add("Physical original documents have not been verified by Registrar.");
        }


        // Strict LRN Input Validation (if provided)
        if (!string.IsNullOrWhiteSpace(request.LRN))
        {
            var cleanLrn = request.LRN.Trim();
            if (cleanLrn.Length != 12 || !cleanLrn.All(char.IsDigit))
            {
                missingRequirements.Add("Learner Reference Number (LRN) must be exactly 12 numeric digits.");
            }
        }

        var bill = await _context.StudentBills
            .FirstOrDefaultAsync(b => b.EnrollmentApplicationId == app.Id ||
                                      (b.Enrollment != null && b.Enrollment.EnrollmentApplicationId == app.Id) ||
                                      (app.StudentId != null && b.Enrollment != null && b.Enrollment.StudentId == app.StudentId));

        if (bill == null)
        {
            missingRequirements.Add("Accounting assessment has not been generated. Please contact Accounting to generate tuition fee assessment.");
        }
        else
        {
            bool isFinanciallyCleared = bill.Balance <= 0 ||
                                        bill.FinancialClearanceStatus == "Cleared" ||
                                        bill.FinancialClearanceStatus == "InstallmentApproved" ||
                                        app.Status == EnrollmentApplicationStatus.PaymentConfirmed;

            if (!isFinanciallyCleared)
            {
                missingRequirements.Add("Accounting assessment and payment confirmation are required before official enrollment.");
            }
        }

        var sectionValidation = await _sectionService.ValidateSectionForEnrollmentAsync(applicationId, request.SectionId);
        if (!sectionValidation.IsValid)
        {
            missingRequirements.AddRange(sectionValidation.Errors);
        }

        if (missingRequirements.Any())
        {
            throw new InvalidOperationException($"ENROLLMENT_PREREQUISITE_FAILED:{string.Join(" | ", missingRequirements)}");
        }

        // ATOMIC DATABASE TRANSACTION
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // Acquire row lock on Section to prevent concurrent capacity race conditions
            await _context.Database.ExecuteSqlRawAsync("SELECT 1 FROM \"Sections\" WHERE \"Id\" = {0} FOR UPDATE", request.SectionId);

            var section = await _context.Sections
                .Include(s => s.ProgramOffering)
                    .ThenInclude(po => po!.GradeLevel)
                .FirstOrDefaultAsync(s => s.Id == request.SectionId);

            if (section == null)
            {
                throw new InvalidOperationException($"ENROLLMENT_PREREQUISITE_FAILED: Selected section with ID {request.SectionId} was not found.");
            }

            var activeCountFinal = await _context.StudentSectionAssignments
                .CountAsync(sa => sa.SectionId == request.SectionId && sa.IsActive);
            if (activeCountFinal >= section.Capacity)
            {
                throw new InvalidOperationException(
                    $"ENROLLMENT_PREREQUISITE_FAILED: Selected section '{section.SectionName}' has reached maximum capacity ({section.Capacity}). Please select a different section.");
            }

            // DYNAMICALLY RESOLVE GradeLevelId AND AcademicYearId FROM SECTION / PROGRAM OFFERING
            int resolvedGradeLevelId = (request.GradeLevelId > 0 && await _context.GradeLevels.AnyAsync(gl => gl.Id == request.GradeLevelId))
                ? request.GradeLevelId
                : section.ProgramOffering.GradeLevelId;

            int resolvedAcademicYearId = (request.AcademicYearId > 0 && await _context.AcademicYears.AnyAsync(ay => ay.Id == request.AcademicYearId))
                ? request.AcademicYearId
                : section.ProgramOffering.AcademicYearId;

            // SERVER-SIDE VALIDATION: APPLICANT GRADE LEVEL VS SECTION GRADE LEVEL COMPATIBILITY
            var sectionGradeLevel = await _context.GradeLevels.FirstOrDefaultAsync(gl => gl.Id == resolvedGradeLevelId);
            if (sectionGradeLevel == null)
            {
                throw new InvalidOperationException($"ENROLLMENT_PREREQUISITE_FAILED: Selected section '{section.SectionName}' belongs to an invalid Grade Level (ID {resolvedGradeLevelId}).");
            }

            if (!string.IsNullOrWhiteSpace(app.GradeApplyingFor))
            {
                var applicantGradeLevel = await _context.GradeLevels
                    .FirstOrDefaultAsync(gl => gl.Name.ToLower() == app.GradeApplyingFor.ToLower().Trim());

                if (applicantGradeLevel != null && applicantGradeLevel.Id != resolvedGradeLevelId)
                {
                    throw new InvalidOperationException(
                        $"ENROLLMENT_PREREQUISITE_FAILED: Section Grade Level Mismatch! Applicant applied for '{app.GradeApplyingFor}', but section '{section.SectionName}' belongs to '{sectionGradeLevel.Name}'. Please assign a section matching {app.GradeApplyingFor}.");
                }
            }

            // SERVER-SIDE VALIDATION: APPLICANT STRAND VS SECTION STRAND COMPATIBILITY FOR SENIOR HIGH (GRADES 11-12)
            bool isSeniorHigh = sectionGradeLevel.EducationLevel == Enums.EducationLevel.SeniorHighSchool ||
                                sectionGradeLevel.Name.Contains("11") || sectionGradeLevel.Name.Contains("12");

            if (!isSeniorHigh)
            {
                // For Grades 1-10: Section ProgramId MUST be null
                if (section.ProgramOffering.ProgramId != null)
                {
                    throw new InvalidOperationException(
                        $"ENROLLMENT_PREREQUISITE_FAILED: Invalid Section Configuration! Grades 1–10 sections must not be assigned a Senior High strand.");
                }
            }
            else
            {
                // For Grades 11-12: Strand is MANDATORY and MUST match section's Program
                if (string.IsNullOrWhiteSpace(app.Strand))
                {
                    throw new InvalidOperationException(
                        $"ENROLLMENT_PREREQUISITE_FAILED: Strand is required for {sectionGradeLevel.Name} enrollment.");
                }

                if (section.ProgramOffering.Program == null && section.ProgramOffering.ProgramId.HasValue)
                {
                    section.ProgramOffering.Program = await _context.Programs.FindAsync(section.ProgramOffering.ProgramId.Value);
                }

                var appStrand = app.Strand.Trim().ToLower();
                var secProgramCode = section.ProgramOffering.Program?.Code?.Trim().ToLower() ?? "";
                var secProgramName = section.ProgramOffering.Program?.Name?.Trim().ToLower() ?? "";

                bool strandMatches = secProgramCode.Contains(appStrand) || secProgramName.Contains(appStrand) || appStrand.Contains(secProgramCode);

                if (!strandMatches)
                {
                    var sectionStrandLabel = section.ProgramOffering.Program?.Code ?? "Unspecified";
                    throw new InvalidOperationException(
                        $"ENROLLMENT_PREREQUISITE_FAILED: The selected section belongs to the {sectionStrandLabel} strand, but the applicant is enrolled under the {app.Strand} strand.");
                }
            }


            Student student = app.Student!;
            if (student == null)
            {
                // Deduplicate: a Student with this email may already exist (e.g. from a previous failed enrollment attempt)
                student = await _context.Students.FirstOrDefaultAsync(s => s.Email.ToLower() == app.Email.ToLower().Trim());
            }

            if (student == null)
            {
                var studentNumber = await _numberGenerator.GenerateStudentNumberAsync();
                var lrnToUse = FormatLrn(request.LRN, studentNumber);
                student = new Student
                {
                    StudentNumber = studentNumber,
                    LRN = lrnToUse,
                    FirstName = app.FirstName,
                    MiddleName = app.MiddleName,
                    LastName = app.LastName,
                    Suffix = app.Suffix,
                    BirthDate = app.BirthDate,
                    Gender = app.Gender,
                    Email = app.Email,
                    PhoneNumber = app.PhoneNumber,
                    Address = app.Address,
                    Barangay = app.Barangay,
                    City = app.City,
                    Province = app.Province,
                    Status = StudentStatus.Enrolled,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Students.Add(student);
                await _context.SaveChangesAsync();
                app.StudentId = student.Id;
            }
            else if (!string.IsNullOrWhiteSpace(request.LRN))
            {
                student.LRN = FormatLrn(request.LRN, student.StudentNumber);
            }

            student.Status = StudentStatus.Enrolled;

            // 1. Assign Section
            var existingAssignment = await _context.StudentSectionAssignments
                .FirstOrDefaultAsync(sa => sa.StudentId == student.Id && sa.SectionId == request.SectionId);

            if (existingAssignment == null)
            {
                _context.StudentSectionAssignments.Add(new StudentSectionAssignment
                {
                    StudentId = student.Id,
                    SectionId = request.SectionId,
                    AssignedAt = DateTime.UtcNow,
                    IsActive = true
                });
            }

            // 2. Create Enrollment Record
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.EnrollmentApplicationId == app.Id);

            if (enrollment == null)
            {
                // Use a short GUID suffix to guarantee EnrollmentNumber uniqueness even if the same
                // student re-enrolls in the same year (e.g. after a failed/rollback attempt).
                var enrollmentSuffix = Guid.NewGuid().ToString("N")[..6].ToUpper();
                enrollment = new Enrollment
                {
                    EnrollmentNumber = $"ENR-{student.StudentNumber}-{enrollmentSuffix}",
                    StudentId = student.Id,
                    EnrollmentApplicationId = app.Id,
                    AcademicYearId = resolvedAcademicYearId,
                    GradeLevelId = resolvedGradeLevelId,
                    SectionId = request.SectionId,
                    EnrollmentType = request.EnrollmentType != 0 ? request.EnrollmentType : EnrollmentType.New,
                    Status = EnrollmentStatus.Enrolled,
                    EnrollmentDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Enrollments.Add(enrollment);
            }
            else
            {
                enrollment.SectionId = request.SectionId;
                enrollment.AcademicYearId = resolvedAcademicYearId;
                enrollment.GradeLevelId = resolvedGradeLevelId;
                enrollment.Status = EnrollmentStatus.Enrolled;
                enrollment.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Link StudentBill to the newly created Enrollment & Student
            if (bill != null)
            {
                bill.EnrollmentId = enrollment.Id;
                bill.UpdatedAt = DateTime.UtcNow;
            }

            // AUTOMATIC SUBJECT & GRADE INITIALIZATION BASED ON CURRICULUM RESOLUTION
            // Filter section teaching assignments to subjects matching:
            // 1. GradeLevelId == resolvedGradeLevelId
            // 2. ProgramId == null (Common Subject) OR ProgramId == section.ProgramOffering.ProgramId (Strand Subject)
            var sectionProgramId = section.ProgramOffering.ProgramId;

            var sectionTeachingAssignments = await _context.TeachingAssignments
                .Include(ta => ta.Subject)
                .Where(ta => ta.SectionId == request.SectionId && ta.IsActive)
                .Where(ta => ta.Subject.GradeLevelId == resolvedGradeLevelId &&
                            (ta.Subject.ProgramId == null || ta.Subject.ProgramId == sectionProgramId))
                .ToListAsync();

            foreach (var ta in sectionTeachingAssignments)
            {
                var existingGrade = await _context.Grades
                    .FirstOrDefaultAsync(g => g.EnrollmentId == enrollment.Id && g.SubjectId == ta.SubjectId);

                if (existingGrade == null)
                {
                    _context.Grades.Add(new Grade
                    {
                        EnrollmentId = enrollment.Id,
                        SubjectId = ta.SubjectId,
                        TeachingAssignmentId = ta.Id,  // Always a valid FK — ta.Id is never 0
                        Status = GradeStatus.Draft,
                        IsCompleted = false
                    });
                }
            }


            // IMMUTABLE ENROLLMENT SNAPSHOT
            var activeSyRecord = await _context.AcademicYears.FirstOrDefaultAsync(sy => sy.Id == resolvedAcademicYearId);
            var snapshotObj = new
            {
                SchoolYear = activeSyRecord?.SchoolYear ?? "2026-2027",
                Semester = activeSyRecord?.CurrentSemester ?? "1st Semester",
                GradeLevelId = resolvedGradeLevelId,
                GradeLevelName = app.GradeApplyingFor,
                SectionId = request.SectionId,
                SectionName = section!.SectionName,
                AdviserName = section.Adviser != null ? $"{section.Adviser.FirstName} {section.Adviser.LastName}" : "Unassigned",
                SubjectCount = sectionTeachingAssignments.Count,
                TuitionFee = bill?.SubTotal ?? 0,
                DiscountAmount = bill?.DiscountAmount ?? 0,
                FinancialClearanceStatus = bill?.FinancialClearanceStatus ?? "Cleared",
                EnrolledAt = DateTime.UtcNow
            };
            var snapshotJson = System.Text.Json.JsonSerializer.Serialize(snapshotObj);

            // 3. Create Permanent Academic History Record with Immutable Snapshot
            _context.EnrollmentHistories.Add(new EnrollmentHistory
            {
                StudentId = student.Id,
                AcademicYearId = resolvedAcademicYearId,
                GradeLevelId = resolvedGradeLevelId,
                SectionId = request.SectionId,
                EnrolledAt = DateTime.UtcNow,
                EnrollmentStatus = "Enrolled",
                SnapshotJson = snapshotJson
            });

            // 4. Mark Application as Enrolled
            app.Status = EnrollmentApplicationStatus.Enrolled;
            app.IsApproved = true;
            app.UpdatedAt = DateTime.UtcNow;

            _context.ApplicationStatusHistories.Add(new ApplicationStatusHistory
            {
                EnrollmentApplicationId = app.Id,
                FromStatus = EnrollmentApplicationStatus.SectionAssignment.ToString(),
                ToStatus = EnrollmentApplicationStatus.Enrolled.ToString(),
                Remarks = $"Assigned to {section!.SectionName} and officially enrolled.",
                Timestamp = DateTime.UtcNow
            });

            // 5. ACCOUNT DE-DUPLICATION & PORTAL ACCOUNTS ACTIVATION
            var normalizedStudentEmail = student.Email.ToLower().Trim();
            var studentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedStudentEmail);
            var tempStudentPassword = $"Noahs@{Random.Shared.Next(100000, 999999)}!";
            if (studentUser == null)
            {
                studentUser = new User
                {
                    Email = student.Email,
                    PasswordHash = _passwordService.HashPassword(tempStudentPassword),
                    Role = UserRole.Student,
                    IsActive = true,
                    IsEmailVerified = true,
                    MustChangePassword = true,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Users.Add(studentUser);
                await _context.SaveChangesAsync();
            }
            else
            {
                studentUser.IsActive = true;
            }
            student.UserId = studentUser.Id;

            // INSTITUTIONAL BUSINESS RULE: Grade 1 – Grade 6 requires Parent Portal creation.
            // Grade 7 – Grade 12 allows Parent Portal creation to be optional as decided by Registrar.
            bool isElementaryGrade = IsElementaryGradeLevel(app.GradeApplyingFor);
            bool shouldCreateParentPortal = isElementaryGrade || request.CreateParentPortal;

            User? parentUser = null;
            Parent? parent = null;
            string? tempParentPassword = null;

            if (shouldCreateParentPortal)
            {
                // TASK 14: Parent Email is owned exclusively by the Admission Application (app.ParentEmail).
                // Enrollment consumes verified admission data; it never accepts ParentEmail from client requests.
                string? parentEmailToUse = app.ParentEmail?.Trim();


                if (string.IsNullOrWhiteSpace(parentEmailToUse))
                {
                    if (isElementaryGrade)
                    {
                        throw new InvalidOperationException("PARENT_EMAIL_REQUIRED:Parent email must be completed during Admission before elementary enrollment can continue.");
                    }
                    else
                    {
                        throw new InvalidOperationException("PARENT_EMAIL_REQUIRED:Parent email was not provided during Admission. Parent Portal cannot be generated until the admission record is updated.");
                    }
                }

                if (string.Equals(parentEmailToUse, student.Email.Trim(), StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException("PARENT_EMAIL_REQUIRED:Parent email cannot be identical to the Student email.");
                }


                var normalizedParentEmail = parentEmailToUse.ToLower().Trim();
                parentUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedParentEmail);
                tempParentPassword = $"Noahs@{Random.Shared.Next(100000, 999999)}!";
                if (parentUser == null)
                {
                    parentUser = new User
                    {
                        Email = parentEmailToUse,
                        PasswordHash = _passwordService.HashPassword(tempParentPassword),
                        Role = UserRole.Parent,
                        IsActive = true,
                        IsEmailVerified = true,
                        MustChangePassword = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Users.Add(parentUser);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    parentUser.IsActive = true;
                }

                // TASK 5: Deduplicate and reuse existing Parent record by UserId, Email, or Contact Number
                parent = await _context.Parents.FirstOrDefaultAsync(p =>
                    (parentUser != null && p.UserId == parentUser.Id) ||
                    p.Email.ToLower() == normalizedParentEmail ||
                    (!string.IsNullOrEmpty(app.ParentContact) && p.PhoneNumber == app.ParentContact)
                );
                if (parent == null)
                {
                    parent = new Parent
                    {
                        FirstName = app.ParentName,
                        LastName = app.LastName,
                        Email = parentEmailToUse,
                        PhoneNumber = app.ParentContact,
                        RelationshipToStudent = app.Relationship,
                        UserId = parentUser.Id,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Parents.Add(parent);
                    await _context.SaveChangesAsync();
                }
                student.ParentId = parent.Id;
            }
            // TASK 2: If shouldCreateParentPortal is false, do NOT set student.ParentId = null!
            // Leave any existing Parent relationship untouched to preserve historical integrity.

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // 6. AUDIT LOG, IN-APP NOTIFICATIONS & WELCOME EMAILS
            if (shouldCreateParentPortal)
            {
                await _auditLogService.LogAsync("EnrollmentCompleted", "EnrollmentApplication", app.Id.ToString(), $"Officially enrolled student {student.FirstName} {student.LastName} ({student.StudentNumber}) into section {section.SectionName}. Created Parent Portal account (ParentPortalCreated).");
            }
            else
            {
                // TASK 4: Improved Audit Log Description
                await _auditLogService.LogAsync("EnrollmentCompleted", "EnrollmentApplication", app.Id.ToString(), $"Officially enrolled student {student.FirstName} {student.LastName} ({student.StudentNumber}) into section {section.SectionName}. Registrar elected not to generate a Parent Portal account under the Grade 7–12 optional parent portal policy (ParentPortalSkipped).");
            }


            try
            {
                await _notificationService.CreateAsync(new CreateNotificationRequest
                {
                    UserId = studentUser.Id,
                    Title = "Official Enrollment Complete",
                    Message = $"Welcome to Noah's Academy! You are officially enrolled in Section {section.SectionName} for SY {snapshotObj.SchoolYear}. Your Student Number is {student.StudentNumber}.",
                    Type = "Success"
                });

                if (shouldCreateParentPortal && parentUser != null)
                {
                    await _notificationService.CreateAsync(new CreateNotificationRequest
                    {
                        UserId = parentUser.Id,
                        Title = "Student Enrollment Confirmed",
                        Message = $"Your child {student.FirstName} {student.LastName} has been officially enrolled in Section {section.SectionName} ({student.StudentNumber}).",
                        Type = "Success"
                    });
                }
            }
            catch { }


            try
            {
                var bodyHtml = $@"<div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2>Welcome to Noah's Academy Incorporated!</h2>
                    <p>Dear <strong>{student.FirstName} {student.LastName}</strong>,</p>
                    <p>Congratulations! Your enrollment into <strong>{section.SectionName}</strong> is officially complete.</p>
                    <div style='background-color: #f4f0ff; padding: 15px; border-radius: 8px; margin: 15px 0;'>
                        <h4>Student Credentials & Roster Details</h4>
                        <p><strong>Student Number:</strong> {student.StudentNumber}</p>
                        <p><strong>Section:</strong> {section.SectionName}</p>
                        <p><strong>Portal Email:</strong> {student.Email}</p>
                    </div>
                    <p>Log in to your student portal at: <a href='https://portal.noahsacademy.edu.ph/login'>https://portal.noahsacademy.edu.ph/login</a></p>
                    <br/><p>Best regards,<br/>Noah's Academy Registrar Office</p>
                </div>";

                await _emailService.SendRawEmailAsync(student.Email, "Welcome to Noah's Academy - Official Enrollment Complete", bodyHtml);
            }
            catch { }

            return true;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<EnrollmentApplicationDto>> GetArchivedApplicationsAsync()
    {
        var apps = await _context.EnrollmentApplications
            .Include(a => a.Documents)
            .Include(a => a.Appointments)
            .Where(a => a.Status == EnrollmentApplicationStatus.Enrolled || a.Status == EnrollmentApplicationStatus.Rejected)
            .OrderByDescending(a => a.UpdatedAt)
            .ToListAsync();

        return apps.Select(MapToApplicationDto).ToList();
    }

    public async Task<RegistrarAnalyticsResponse> GetRegistrarAnalyticsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek);

        var appsToday = await _context.EnrollmentApplications.CountAsync(a => a.CreatedAt >= today);
        var appsWeek = await _context.EnrollmentApplications.CountAsync(a => a.CreatedAt >= startOfWeek);
        var underReview = await _context.EnrollmentApplications.CountAsync(a => a.Status == EnrollmentApplicationStatus.UnderReview);
        var docsPending = await _context.EnrollmentApplications.CountAsync(a => a.Status == EnrollmentApplicationStatus.DocumentsRequired || a.Status == EnrollmentApplicationStatus.DocumentsSubmitted);
        var assessmentsPending = await _context.EnrollmentApplications.CountAsync(a => a.Status == EnrollmentApplicationStatus.Approved || a.Status == EnrollmentApplicationStatus.AccountingAssessment);
        var enrolled = await _context.EnrollmentApplications.CountAsync(a => a.Status == EnrollmentApplicationStatus.Enrolled);
        var rejected = await _context.EnrollmentApplications.CountAsync(a => a.Status == EnrollmentApplicationStatus.Rejected);
        var totalAll = await _context.EnrollmentApplications.CountAsync();

        var convRate = totalAll > 0 ? (double)enrolled / totalAll * 100.0 : 0.0;

        // Calculate actual average processing time from Submitted → Enrolled
        // Step 1: Fetch timestamps of "Enrolled" events per application
        var enrolledTimestamps = await _context.ApplicationStatusHistories
            .Where(h => h.ToStatus == "Enrolled")
            .Select(h => new { h.EnrollmentApplicationId, EnrolledAt = h.Timestamp })
            .ToListAsync();

        // Step 2: Fetch timestamps of initial submission events per application
        var submittedTimestamps = await _context.ApplicationStatusHistories
            .Where(h => h.ToStatus == "ApplicationSubmitted" || h.FromStatus == null)
            .Select(h => new { h.EnrollmentApplicationId, SubmittedAt = h.Timestamp })
            .ToListAsync();

        // Step 3: Join in-memory and compute TotalHours (PostgreSQL-compatible — avoids SQL Server-only DateDiffHour)
        var processingTimes = enrolledTimestamps
            .Join(submittedTimestamps,
                e => e.EnrollmentApplicationId,
                s => s.EnrollmentApplicationId,
                (e, s) => (e.EnrolledAt - s.SubmittedAt).TotalHours)
            .Where(hours => hours >= 0)
            .ToList();

        var avgProcessingHours = processingTimes.Count > 0
            ? Math.Round(processingTimes.Average(), 1)
            : 0.0;

        return new RegistrarAnalyticsResponse
        {
            SubmittedToday = appsToday,
            SubmittedThisWeek = appsWeek,
            UnderReview = underReview,
            DocumentsPending = docsPending,
            AssessmentsPending = assessmentsPending,
            EnrolledStudents = enrolled,
            RejectedApplications = rejected,
            AverageProcessingTimeHours = avgProcessingHours,
            ConversionRatePercentage = Math.Round(convRate, 1)
        };
    }

    public async Task<AccountingAnalyticsResponse> GetAccountingAnalyticsAsync()
    {
        var today = DateTime.UtcNow.Date;

        var pendingAssessments = await _context.EnrollmentApplications.CountAsync(a => a.Status == EnrollmentApplicationStatus.Approved || a.Status == EnrollmentApplicationStatus.AccountingAssessment);
        var paymentsToday = await _context.Payments.Where(p => p.PaymentDate >= today).SumAsync(p => p.Amount);
        var outstanding = await _context.StudentBills.SumAsync(b => b.TotalAmount - b.AmountPaid);
        var receiptsToday = await _context.OfficialReceipts.CountAsync(r => r.IssuedAt >= today);

        return new AccountingAnalyticsResponse
        {
            PendingAssessments = pendingAssessments,
            PaymentsToday = paymentsToday,
            OutstandingBalances = outstanding,
            OfficialReceiptsIssuedToday = receiptsToday
        };
    }

    public async Task<PrincipalAnalyticsResponse> GetPrincipalAnalyticsAsync()
    {
        var totalEnrolled = await _context.Enrollments.CountAsync(e => e.Status == EnrollmentStatus.Enrolled);
        var newStudents = await _context.Enrollments.CountAsync(e => e.Status == EnrollmentStatus.Enrolled && e.EnrollmentType == EnrollmentType.New);
        var returningStudents = await _context.Enrollments.CountAsync(e => e.Status == EnrollmentStatus.Enrolled && e.EnrollmentType == EnrollmentType.Returning);

        var enrollmentsWithGrade = await _context.Enrollments
            .Include(e => e.GradeLevel)
            .Where(e => e.Status == EnrollmentStatus.Enrolled && e.GradeLevelId != null)
            .ToListAsync();

        var byGrade = enrollmentsWithGrade
            .GroupBy(e => e.GradeLevel?.Name ?? "Other")
            .ToDictionary(g => g.Key, g => g.Count());

        return new PrincipalAnalyticsResponse
        {
            TotalEnrollment = totalEnrolled,
            NewStudentsCount = newStudents,
            ReturningStudentsCount = returningStudents,
            EnrollmentByGradeLevel = byGrade
        };
    }

    public async Task<StudentEnrollmentStatusResponse> GetStudentEnrollmentStatusAsync(int userId)
    {
        var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
        var activeAy = await _context.AcademicYears.FirstOrDefaultAsync(ay => ay.Status == AcademicYearStatus.Current)
                    ?? await _context.AcademicYears.FirstOrDefaultAsync();

        var ayName = activeAy?.SchoolYear ?? "2026–2027";
        var isOpen = activeAy?.IsEnrollmentOpen ?? true;
        var startText = activeAy?.EnrollmentStartDate?.ToString("MMM dd") ?? "May 01";
        var endText = activeAy?.EnrollmentEndDate?.ToString("MMM dd") ?? "Jun 30";

        if (student == null)
        {
            return new StudentEnrollmentStatusResponse
            {
                SchoolYear = ayName,
                IsEnrollmentOpen = isOpen,
                EnrollmentPeriodText = $"{startText} – {endText}",
                Status = "Not Eligible",
                CanEnrollNow = false
            };
        }

        var existingEnrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.StudentId == student.Id && e.AcademicYearId == (activeAy != null ? activeAy.Id : 0));

        if (existingEnrollment == null)
        {
            return new StudentEnrollmentStatusResponse
            {
                SchoolYear = ayName,
                IsEnrollmentOpen = isOpen,
                EnrollmentPeriodText = $"{startText} – {endText}",
                Status = "Eligible",
                CanEnrollNow = isOpen,
                AssessmentStatus = "Pending",
                PaymentStatus = "Pending",
                SectionStatus = "Not Yet Assigned"
            };
        }

        return new StudentEnrollmentStatusResponse
        {
            SchoolYear = ayName,
            IsEnrollmentOpen = isOpen,
            EnrollmentPeriodText = $"{startText} – {endText}",
            Status = existingEnrollment.Status.ToString(),
            CanEnrollNow = false,
            AssessmentStatus = existingEnrollment.Status >= EnrollmentStatus.Enrolled ? "Ready" : "Pending",
            PaymentStatus = existingEnrollment.Status >= EnrollmentStatus.Enrolled ? "Confirmed" : "Pending",
            SectionStatus = existingEnrollment.SectionId.HasValue ? "Assigned" : "Not Yet Assigned"
        };
    }

    public async Task<bool> ConfirmStudentReEnrollmentAsync(int userId)
    {
        var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
        if (student == null) return false;

        var activeAy = await _context.AcademicYears.FirstOrDefaultAsync(ay => ay.Status == AcademicYearStatus.Current)
                    ?? await _context.AcademicYears.FirstOrDefaultAsync();

        if (activeAy != null && !activeAy.IsReturningEnrollmentOpen)
            throw new InvalidOperationException("Returning student re-enrollment is currently closed. Please contact the Registrar's Office.");


        var activeAyId = activeAy != null ? activeAy.Id : 0;
        var existing = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.StudentId == student.Id && e.AcademicYearId == activeAyId);

        if (existing != null)
            throw new InvalidOperationException("Re-enrollment request already submitted.");

        var enrollment = new Enrollment
        {
            EnrollmentNumber = $"ENR-RET-{student.StudentNumber}-{DateTime.UtcNow.Year}",
            StudentId = student.Id,
            AcademicYearId = activeAy?.Id ?? 1,
            EnrollmentType = EnrollmentType.Returning,
            Status = EnrollmentStatus.Pending,
            EnrollmentDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.Enrollments.Add(enrollment);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<AdmissionDocumentTypeDto>> GetAdmissionDocumentTypesAsync()
    {
        return await _context.AdmissionDocumentTypes
            .Where(d => d.IsActive)
            .OrderBy(d => d.DisplayOrder)
            .Select(d => new AdmissionDocumentTypeDto
            {
                Id = d.Id,
                Name = d.Name,
                IsRequired = d.IsRequired,
                ApplicableEducationLevel = d.ApplicableEducationLevel,
                DisplayOrder = d.DisplayOrder,
                IsActive = d.IsActive
            }).ToListAsync();
    }

    public async Task<List<EnrollmentResponse>> GetAllAsync()
    {
        var apps = await _context.EnrollmentApplications
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return apps.Select(MapToResponse).ToList();
    }



    public async Task<EnrollmentResponse?> GetByIdAsync(int id)
    {
        var app = await _context.EnrollmentApplications.FirstOrDefaultAsync(x => x.Id == id);
        return app == null ? null : MapToResponse(app);
    }

    public async Task<EnrollmentResponse?> UpdateAsync(int id, UpdateEnrollmentRequest request)
    {
        var app = await _context.EnrollmentApplications.FirstOrDefaultAsync(x => x.Id == id);
        if (app == null) return null;

        app.FirstName = request.FirstName;
        app.LastName = request.LastName;
        app.Email = request.Email;
        app.PhoneNumber = request.PhoneNumber;
        app.GradeApplyingFor = request.GradeApplyingFor;
        app.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToResponse(app);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var app = await _context.EnrollmentApplications.FirstOrDefaultAsync(x => x.Id == id);
        if (app == null) return false;

        _context.EnrollmentApplications.Remove(app);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ApproveAsync(int id)
    {
        return await UpdateApplicationStageAsync(id, new UpdateApplicationStageRequest
        {
            Status = EnrollmentApplicationStatus.Approved.ToString(),
            ApplicantRemarks = "Application approved for assessment."
        });
    }

    public async Task<bool> RejectAsync(int id)
    {
        return await UpdateApplicationStageAsync(id, new UpdateApplicationStageRequest
        {
            Status = EnrollmentApplicationStatus.Rejected.ToString(),
            ApplicantRemarks = "Application has been declined by the Registrar."
        });
    }

    public async Task<ApproveAndEnrollResponse> ApproveAndEnrollAsync(int applicationId, ApproveAndEnrollRequest request)
    {
        await AssignSectionAndEnrollAsync(applicationId, new AssignSectionAndEnrollRequest
        {
            SectionId = request.SectionId
        });

        var app = await _context.EnrollmentApplications.Include(a => a.Student).FirstOrDefaultAsync(a => a.Id == applicationId);
        return new ApproveAndEnrollResponse
        {
            StudentNumber = app?.Student?.StudentNumber ?? "STU-0000",
            TemporaryPassword = "Password123!"
        };
    }

    private static EnrollmentResponse MapToResponse(EnrollmentApplication x)
    {
        return new EnrollmentResponse
        {
            Id = x.Id,
            ApplicationNumber = x.ApplicationNumber,
            FullName = $"{x.FirstName} {x.LastName}",
            GradeApplyingFor = x.GradeApplyingFor,
            Track = x.Track,
            Strand = x.Strand,
            PreviousSchool = x.PreviousSchool,
            Email = x.Email,
            Status = x.Status.ToString(),
            IsApproved = x.IsApproved,
            CreatedAt = x.CreatedAt
        };
    }

    private static (int stageIndex, string stageTitle, string nextStep) GetStageDetails(EnrollmentApplicationStatus status)
    {
        return status switch
        {
            EnrollmentApplicationStatus.Submitted => (0, "Application Submitted", "Under Review by Registrar"),
            EnrollmentApplicationStatus.UnderReview => (1, "Under Review", "Registrar Document Check"),
            EnrollmentApplicationStatus.DocumentsRequired => (2, "Documents Required", "Please submit required documents"),
            EnrollmentApplicationStatus.DocumentsSubmitted => (3, "Documents Submitted", "Document Verification in progress"),
            EnrollmentApplicationStatus.DocumentsVerified => (4, "Documents Verified", "Awaiting Final Approval"),
            EnrollmentApplicationStatus.Approved => (5, "Approved", "Forwarded to Accounting for Assessment"),
            EnrollmentApplicationStatus.AccountingAssessment => (6, "Accounting Assessment", "Tuition & Fees Assessment Ready"),
            EnrollmentApplicationStatus.PaymentConfirmed => (7, "Payment Confirmed", "Section & Schedule Assignment"),
            EnrollmentApplicationStatus.SectionAssignment => (8, "Section Assignment", "Final Enrollment Confirmation"),
            EnrollmentApplicationStatus.Enrolled => (9, "Officially Enrolled", "Welcome to Noah's Academy!"),
            EnrollmentApplicationStatus.Rejected => (99, "Application Declined", "Contact Registrar Office"),
            _ => (0, "Application Submitted", "Under Review")
        };
    }

    // Digital Document Management System Implementation Methods
    public async Task<UploadDocumentResponseDto> UploadDocumentAsync(
        int applicationId,
        int documentTypeId,
        Microsoft.AspNetCore.Http.IFormFile file,
        int? userId)
    {
        var app = await _context.EnrollmentApplications
            .Include(a => a.Documents)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (app == null)
        {
            throw new InvalidOperationException($"Enrollment application with ID {applicationId} was not found.");
        }

        var docType = await _context.AdmissionDocumentTypes.FirstOrDefaultAsync(d => d.Id == documentTypeId);
        var docTypeName = docType?.Name ?? "Admission Requirement Document";

        // Save physical file using FileStorageService (GUID filename under wwwroot/uploads/admissions/{id}/)
        var (storedFilename, storagePath, contentType, fileSize) = await _fileStorageService.SaveAdmissionDocumentAsync(applicationId, file);

        // Find existing active document entry for this documentTypeId
        var existingDoc = app.Documents
            .FirstOrDefault(d => d.AdmissionDocumentTypeId == documentTypeId && d.IsActive);

        EnrollmentApplicationDocument targetDoc;

        if (existingDoc != null && !string.IsNullOrEmpty(existingDoc.StoredFilename))
        {
            // Create a new version if file was previously uploaded/rejected
            existingDoc.IsActive = false;

            targetDoc = new EnrollmentApplicationDocument
            {
                EnrollmentApplicationId = applicationId,
                AdmissionDocumentTypeId = documentTypeId,
                DocumentName = docTypeName,
                OriginalFilename = file.FileName,
                StoredFilename = storedFilename,
                StoragePath = storagePath,
                ContentType = contentType,
                FileSize = fileSize,
                UploadedAt = DateTime.UtcNow,
                UploadedByUserId = userId,
                Status = "Uploaded",
                Remarks = "Replacement version uploaded by applicant.",
                Version = existingDoc.Version + 1,
                IsActive = true,
                ParentDocumentId = existingDoc.Id
            };
            _context.EnrollmentApplicationDocuments.Add(targetDoc);
        }
        else if (existingDoc != null)
        {
            // Populate initial empty placeholder entry
            existingDoc.OriginalFilename = file.FileName;
            existingDoc.StoredFilename = storedFilename;
            existingDoc.StoragePath = storagePath;
            existingDoc.ContentType = contentType;
            existingDoc.FileSize = fileSize;
            existingDoc.UploadedAt = DateTime.UtcNow;
            existingDoc.UploadedByUserId = userId;
            existingDoc.Status = "Uploaded";
            existingDoc.DigitalStatus = "Uploaded";
            existingDoc.Remarks = "Document uploaded by applicant.";
            targetDoc = existingDoc;
        }
        else
        {
            // Create new entry
            targetDoc = new EnrollmentApplicationDocument
            {
                EnrollmentApplicationId = applicationId,
                AdmissionDocumentTypeId = documentTypeId,
                DocumentName = docTypeName,
                OriginalFilename = file.FileName,
                StoredFilename = storedFilename,
                StoragePath = storagePath,
                ContentType = contentType,
                FileSize = fileSize,
                UploadedAt = DateTime.UtcNow,
                UploadedByUserId = userId,
                Status = "Uploaded",
                DigitalStatus = "Uploaded",
                Remarks = "Document uploaded by applicant.",
                Version = 1,
                IsActive = true
            };
            _context.EnrollmentApplicationDocuments.Add(targetDoc);
        }

        // Update application overall status if appropriate
        if (app.Status == EnrollmentApplicationStatus.Submitted || app.Status == EnrollmentApplicationStatus.DocumentsRequired)
        {
            app.Status = EnrollmentApplicationStatus.DocumentsSubmitted;
            app.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        // 1. Audit Log
        try
        {
            await _auditLogService.LogAsync(
                "DocumentUploaded",
                $"Applicant uploaded {docTypeName} (File: {file.FileName}, Version: {targetDoc.Version}) for application {app.ApplicationNumber}.",
                userId?.ToString() ?? "Applicant",
                "Applicant");
        }
        catch { }

        // 2. Notify Registrar Role
        try
        {
            await _notificationService.CreateAsync(new CreateNotificationRequest
            {
                TargetRole = "Registrar",
                Title = "New Admission Document Uploaded",
                Message = $"New document '{docTypeName}' (V{targetDoc.Version}) uploaded for application {app.ApplicationNumber}.",
                Type = "Info"
            });
        }
        catch { }

        return new UploadDocumentResponseDto
        {
            Id = targetDoc.Id,
            EnrollmentApplicationId = targetDoc.EnrollmentApplicationId,
            AdmissionDocumentTypeId = targetDoc.AdmissionDocumentTypeId,
            DocumentName = targetDoc.DocumentName,
            OriginalFilename = targetDoc.OriginalFilename ?? file.FileName,
            StoredFilename = targetDoc.StoredFilename ?? storedFilename,
            ContentType = targetDoc.ContentType ?? contentType,
            FileSize = targetDoc.FileSize ?? fileSize,
            UploadedAt = targetDoc.UploadedAt ?? DateTime.UtcNow,
            Status = targetDoc.Status,
            Version = targetDoc.Version,
            DownloadUrl = $"/api/Enrollment/documents/{targetDoc.Id}/download",
            PreviewUrl = $"/api/Enrollment/documents/{targetDoc.Id}/preview"
        };
    }

    public async Task<ApplicationDocumentDto?> GetDocumentMetadataAsync(int documentId)
    {
        var doc = await _context.EnrollmentApplicationDocuments
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (doc == null) return null;

        return new ApplicationDocumentDto
        {
            Id = doc.Id,
            AdmissionDocumentTypeId = doc.AdmissionDocumentTypeId,
            DocumentName = doc.DocumentName,
            Status = doc.Status,
            Remarks = doc.Remarks,
            OriginalFilename = doc.OriginalFilename,
            ContentType = doc.ContentType,
            FileSize = doc.FileSize,
            UploadedAt = doc.UploadedAt,
            VerifiedAt = doc.VerifiedAt,
            Version = doc.Version,
            IsActive = doc.IsActive,
            DownloadUrl = !string.IsNullOrEmpty(doc.StoredFilename) ? $"/api/Enrollment/documents/{doc.Id}/download" : null,
            PreviewUrl = !string.IsNullOrEmpty(doc.StoredFilename) ? $"/api/Enrollment/documents/{doc.Id}/preview" : null,
        };
    }

    public async Task<(Stream fileStream, string contentType, string originalFilename)?> GetDocumentFileAsync(
        int documentId,
        string userRole,
        string? userEmail)
    {
        var doc = await _context.EnrollmentApplicationDocuments
            .Include(d => d.EnrollmentApplication)
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (doc == null || string.IsNullOrEmpty(doc.StoragePath)) return null;

        // Security check: Parents & Teachers cannot access applicant documents
        if (userRole.Equals("Parent", StringComparison.OrdinalIgnoreCase) || userRole.Equals("Teacher", StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Your user role is not authorized to access applicant documents.");
        }

        // Security check: Applicants/Students can only access their own application documents
        if (userRole.Equals("Applicant", StringComparison.OrdinalIgnoreCase) || userRole.Equals("Student", StringComparison.OrdinalIgnoreCase))
        {
            if (!string.IsNullOrEmpty(userEmail) && !doc.EnrollmentApplication.Email.Equals(userEmail.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("You are not authorized to view or download documents from another applicant.");
            }
        }

        var result = _fileStorageService.GetFileStream(doc.StoragePath);
        if (result == null) return null;

        var originalFilename = !string.IsNullOrEmpty(doc.OriginalFilename) ? doc.OriginalFilename : result.Value.storedFilename;

        return (result.Value.fileStream, result.Value.contentType, originalFilename);
    }

    public async Task<ApplicationDocumentDto> VerifyDocumentStatusAsync(
        int documentId,
        VerifyDocumentRequestDto request,
        int employeeId,
        string employeeRole)
    {
        var doc = await _context.EnrollmentApplicationDocuments
            .Include(d => d.EnrollmentApplication)
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (doc == null)
        {
            throw new InvalidOperationException($"Document entry with ID {documentId} was not found.");
        }

        var oldStatus = doc.Status;
        doc.Status = request.Status;
        doc.DigitalStatus = request.Status;
        doc.Remarks = request.Remarks;
        doc.VerifiedAt = DateTime.UtcNow;
        doc.VerifiedByEmployeeId = employeeId;

        var app = doc.EnrollmentApplication;

        if (request.Status == "Verified")
        {
            // Audit Log
            try
            {
                await _auditLogService.LogAsync(
                    "RegistrarVerifiedDigitalDocuments",
                    $"Registrar verified digital copy for document '{doc.DocumentName}' (V{doc.Version}) for application {app.ApplicationNumber}.",
                    employeeId.ToString(),
                    employeeRole);
            }
            catch { }

            // Notification
            try
            {
                await _notificationService.CreateAsync(new CreateNotificationRequest
                {
                    TargetRole = "Applicant",
                    Title = "Digital Documents Approved",
                    Message = $"Your uploaded digital copy of {doc.DocumentName} for application {app.ApplicationNumber} has been verified by the Registrar.",
                    Type = "Success"
                });
            }
            catch { }

            // Email: After Digital Verification
            try
            {
                var bodyHtml = $@"<div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2>Noah's Academy Incorporated</h2>
                    <h3 style='color: #6b21a8;'>Digital Documents Successfully Reviewed</h3>
                    <p>Dear <strong>{app.FirstName} {app.LastName}</strong>,</p>
                    <p>Your uploaded digital documents have been successfully reviewed by the Registrar.</p>
                    <div style='background-color: #f4f0ff; padding: 15px; border-left: 4px solid #7e22ce; margin: 15px 0;'>
                        <strong>Next Step Required:</strong> Please visit Noah's Academy Incorporated and bring the original copies of your required documents for final verification.
                    </div>
                    <p><em>Note: Your admission cannot proceed until the original physical documents have been verified at the Registrar's Office.</em></p>
                    <br/><p>Best regards,<br/><strong>Noah's Academy Registrar Office</strong></p>
                </div>";
                await _emailService.SendRawEmailAsync(app.Email, "Digital Documents Successfully Reviewed", bodyHtml);
            }
            catch { }

            // Check if all active required digital documents are verified
            var requiredDocTypeIds = await _context.AdmissionDocumentTypes.Where(d => d.IsActive && d.IsRequired).Select(d => d.Id).ToListAsync();
            var allRequiredDigitalVerified = await _context.EnrollmentApplicationDocuments
                .Where(d => d.EnrollmentApplicationId == app.Id && d.IsActive && d.AdmissionDocumentTypeId.HasValue && requiredDocTypeIds.Contains(d.AdmissionDocumentTypeId.Value))
                .AllAsync(d => d.DigitalStatus == "Verified" || d.Status == "Verified");

            if (allRequiredDigitalVerified)
            {
                app.Status = EnrollmentApplicationStatus.DocumentsVerified;
                app.ApplicantRemarks = "Digital copies reviewed. Please bring original physical documents to the Registrar Office for final verification.";
                app.UpdatedAt = DateTime.UtcNow;
            }
        }
        else if (request.Status == "Rejected")
        {
            doc.DigitalStatus = "Rejected";
            app.Status = EnrollmentApplicationStatus.DocumentsRequired;
            app.UpdatedAt = DateTime.UtcNow;

            // Audit Log
            try
            {
                await _auditLogService.LogAsync(
                    "RegistrarRequestedReplacement",
                    $"Registrar rejected digital copy for document '{doc.DocumentName}' (V{doc.Version}) for application {app.ApplicationNumber}. Reason: {request.Remarks}",
                    employeeId.ToString(),
                    employeeRole);
            }
            catch { }

            // Notification
            try
            {
                await _notificationService.CreateAsync(new CreateNotificationRequest
                {
                    TargetRole = "Applicant",
                    Title = "Digital Document Requires Replacement",
                    Message = $"Your digital copy of {doc.DocumentName} for application {app.ApplicationNumber} was rejected. Reason: {request.Remarks}",
                    Type = "Warning"
                });
            }
            catch { }

            // Email
            try
            {
                var bodyHtml = $@"<div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2>Noah's Academy Incorporated</h2>
                    <h3 style='color: #b91c1c;'>Digital Document Requires Replacement</h3>
                    <p>Dear <strong>{app.FirstName} {app.LastName}</strong>,</p>
                    <p>Your submitted digital document <strong>{doc.DocumentName}</strong> for application reference <strong>{app.ApplicationNumber}</strong> requires replacement.</p>
                    <div style='background-color: #fef2f2; padding: 12px; border-left: 4px solid #ef4444; margin: 15px 0;'><strong>Registrar Reason / Instructions:</strong> {request.Remarks ?? "Please upload a clearer scanned copy."}</div>
                    <p>Please log in to track and upload a replacement document at: <a href='https://portal.noahsacademy.edu.ph/admissions/track'>https://portal.noahsacademy.edu.ph/admissions/track</a></p>
                    <br/><p>Best regards,<br/><strong>Noah's Academy Registrar Office</strong></p>
                </div>";
                await _emailService.SendRawEmailAsync(app.Email, $"Document Action Required - {doc.DocumentName}", bodyHtml);
            }
            catch { }
        }

        await _context.SaveChangesAsync();

        return new ApplicationDocumentDto
        {
            Id = doc.Id,
            AdmissionDocumentTypeId = doc.AdmissionDocumentTypeId,
            DocumentName = doc.DocumentName,
            Status = doc.Status,
            DigitalStatus = doc.DigitalStatus,
            OriginalStatus = doc.OriginalStatus,
            Remarks = doc.Remarks,
            OriginalRemarks = doc.OriginalRemarks,
            OriginalFilename = doc.OriginalFilename,
            ContentType = doc.ContentType,
            FileSize = doc.FileSize,
            UploadedAt = doc.UploadedAt,
            VerifiedAt = doc.VerifiedAt,
            OriginalSubmittedAt = doc.OriginalSubmittedAt,
            OriginalVerifiedAt = doc.OriginalVerifiedAt,
            Version = doc.Version,
            IsActive = doc.IsActive,
            DownloadUrl = !string.IsNullOrEmpty(doc.StoredFilename) ? $"/api/Enrollment/documents/{doc.Id}/download" : null,
            PreviewUrl = !string.IsNullOrEmpty(doc.StoredFilename) ? $"/api/Enrollment/documents/{doc.Id}/preview" : null,
        };
    }

    public async Task<ApplicationDocumentDto> VerifyOriginalDocumentStatusAsync(
        int documentId,
        VerifyOriginalDocumentRequestDto request,
        int employeeId,
        string employeeRole)
    {
        var doc = await _context.EnrollmentApplicationDocuments
            .Include(d => d.EnrollmentApplication)
            .FirstOrDefaultAsync(d => d.Id == documentId);

        if (doc == null)
        {
            throw new InvalidOperationException($"Document entry with ID {documentId} was not found.");
        }

        if (request.Status == "Verified" && doc.DigitalStatus != "Verified")
        {
            throw new InvalidOperationException($"Digital copy of '{doc.DocumentName}' must be verified by Registrar before physical original document can be verified.");
        }

        doc.OriginalStatus = request.Status;
        doc.OriginalRemarks = request.Remarks;

        var app = doc.EnrollmentApplication;

        if (request.Status == "Submitted")
        {
            doc.OriginalSubmittedAt = DateTime.UtcNow;

            // Audit Log
            try
            {
                await _auditLogService.LogAsync(
                    "ApplicantSubmittedOriginalDocuments",
                    $"Applicant submitted physical original document '{doc.DocumentName}' for application {app.ApplicationNumber}.",
                    employeeId.ToString(),
                    employeeRole);
            }
            catch { }

            // Notification
            try
            {
                await _notificationService.CreateAsync(new CreateNotificationRequest
                {
                    TargetRole = "Registrar",
                    Title = "Original Documents Submitted",
                    Message = $"Original physical document '{doc.DocumentName}' for application {app.ApplicationNumber} submitted to Registrar.",
                    Type = "Info"
                });
            }
            catch { }
        }
        else if (request.Status == "Verified")
        {
            doc.OriginalVerifiedAt = DateTime.UtcNow;
            doc.OriginalVerifiedByEmployeeId = employeeId;
            if (!doc.OriginalSubmittedAt.HasValue) doc.OriginalSubmittedAt = DateTime.UtcNow;

            // Audit Log
            try
            {
                await _auditLogService.LogAsync(
                    "RegistrarVerifiedOriginalDocuments",
                    $"Registrar verified physical original document '{doc.DocumentName}' for application {app.ApplicationNumber}.",
                    employeeId.ToString(),
                    employeeRole);
            }
            catch { }

            // Notification
            try
            {
                await _notificationService.CreateAsync(new CreateNotificationRequest
                {
                    TargetRole = "Applicant",
                    Title = "Original Documents Verified",
                    Message = $"Your original physical copy of {doc.DocumentName} for application {app.ApplicationNumber} has been verified by the Registrar.",
                    Type = "Success"
                });
            }
            catch { }

            // Check if ALL required original documents are verified
            var requiredDocTypeIds = await _context.AdmissionDocumentTypes.Where(d => d.IsActive && d.IsRequired).Select(d => d.Id).ToListAsync();
            var allRequiredOriginalsVerified = await _context.EnrollmentApplicationDocuments
                .Where(d => d.EnrollmentApplicationId == app.Id && d.IsActive && d.AdmissionDocumentTypeId.HasValue && requiredDocTypeIds.Contains(d.AdmissionDocumentTypeId.Value))
                .AllAsync(d => d.OriginalStatus == "Verified");

            if (allRequiredOriginalsVerified)
            {
                app.Status = EnrollmentApplicationStatus.Approved;
                app.IsApproved = true;
                app.ApplicantRemarks = "All original physical documents verified by Registrar. Application approved and eligible for Accounting Assessment.";
                app.UpdatedAt = DateTime.UtcNow;

                // Email: After Original Verification
                try
                {
                    var bodyHtml = $@"<div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                        <h2>Noah's Academy Incorporated</h2>
                        <h3 style='color: #047857;'>Original Documents Successfully Verified</h3>
                        <p>Dear <strong>{app.FirstName} {app.LastName}</strong>,</p>
                        <p>Your original documents have been successfully verified by the Registrar's Office.</p>
                        <div style='background-color: #ecfdf5; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0;'>
                            <strong>Application Status:</strong> Approved for Accounting Assessment.
                        </div>
                        <p>Your application is now eligible to proceed to the Assessment stage.</p>
                        <br/><p>Best regards,<br/><strong>Noah's Academy Registrar Office</strong></p>
                    </div>";
                    await _emailService.SendRawEmailAsync(app.Email, "Original Documents Successfully Verified", bodyHtml);
                }
                catch { }
            }
        }
        else if (request.Status == "Rejected")
        {
            doc.OriginalStatus = "Rejected";

            // Audit Log
            try
            {
                await _auditLogService.LogAsync(
                    "RegistrarRejectedOriginalDocuments",
                    $"Registrar rejected physical original document '{doc.DocumentName}' for application {app.ApplicationNumber}. Reason: {request.Remarks}",
                    employeeId.ToString(),
                    employeeRole);
            }
            catch { }

            // Notification
            try
            {
                await _notificationService.CreateAsync(new CreateNotificationRequest
                {
                    TargetRole = "Applicant",
                    Title = "Original Document Rejected",
                    Message = $"Your original physical copy of {doc.DocumentName} was rejected. Reason: {request.Remarks}",
                    Type = "Warning"
                });
            }
            catch { }
        }

        await _context.SaveChangesAsync();

        return new ApplicationDocumentDto
        {
            Id = doc.Id,
            AdmissionDocumentTypeId = doc.AdmissionDocumentTypeId,
            DocumentName = doc.DocumentName,
            Status = doc.Status,
            DigitalStatus = doc.DigitalStatus,
            OriginalStatus = doc.OriginalStatus,
            Remarks = doc.Remarks,
            OriginalRemarks = doc.OriginalRemarks,
            OriginalFilename = doc.OriginalFilename,
            ContentType = doc.ContentType,
            FileSize = doc.FileSize,
            UploadedAt = doc.UploadedAt,
            VerifiedAt = doc.VerifiedAt,
            OriginalSubmittedAt = doc.OriginalSubmittedAt,
            OriginalVerifiedAt = doc.OriginalVerifiedAt,
            Version = doc.Version,
            IsActive = doc.IsActive,
            DownloadUrl = !string.IsNullOrEmpty(doc.StoredFilename) ? $"/api/Enrollment/documents/{doc.Id}/download" : null,
            PreviewUrl = !string.IsNullOrEmpty(doc.StoredFilename) ? $"/api/Enrollment/documents/{doc.Id}/preview" : null,
        };
    }

    public async Task<List<ApplicationDocumentDto>> GetDocumentVersionHistoryAsync(int documentId)
    {
        var targetDoc = await _context.EnrollmentApplicationDocuments.FirstOrDefaultAsync(d => d.Id == documentId);
        if (targetDoc == null) return new List<ApplicationDocumentDto>();

        var history = await _context.EnrollmentApplicationDocuments
            .Where(d => d.EnrollmentApplicationId == targetDoc.EnrollmentApplicationId && d.AdmissionDocumentTypeId == targetDoc.AdmissionDocumentTypeId)
            .OrderByDescending(d => d.Version)
            .Select(d => new ApplicationDocumentDto
            {
                Id = d.Id,
                AdmissionDocumentTypeId = d.AdmissionDocumentTypeId,
                DocumentName = d.DocumentName,
                Status = d.Status,
                Remarks = d.Remarks,
                OriginalFilename = d.OriginalFilename,
                ContentType = d.ContentType,
                FileSize = d.FileSize,
                UploadedAt = d.UploadedAt,
                VerifiedAt = d.VerifiedAt,
                Version = d.Version,
                IsActive = d.IsActive,
                DownloadUrl = !string.IsNullOrEmpty(d.StoredFilename) ? $"/api/Enrollment/documents/{d.Id}/download" : null,
                PreviewUrl = !string.IsNullOrEmpty(d.StoredFilename) ? $"/api/Enrollment/documents/{d.Id}/preview" : null,
            }).ToListAsync();

        return history;
    }

    public async Task<AppointmentDto> ScheduleAppointmentAsync(int applicationId, CreateAppointmentRequestDto request, int? userId)
    {
        var app = await _context.EnrollmentApplications
            .Include(a => a.Appointments)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (app == null)
            throw new InvalidOperationException($"Application with ID {applicationId} not found.");

        var appointment = new DocumentSubmissionAppointment
        {
            EnrollmentApplicationId = applicationId,
            AppointmentDate = request.AppointmentDate,
            AppointmentTime = request.AppointmentTime ?? "9:00 AM",
            Status = "Pending",
            ScheduledByUserId = userId,
            Remarks = request.Remarks,
            CreatedAt = DateTime.UtcNow
        };

        _context.DocumentSubmissionAppointments.Add(appointment);
        app.ApplicantRemarks = $"Document submission appointment scheduled for {request.AppointmentDate:MMM dd, yyyy} at {request.AppointmentTime}.";
        app.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Audit Log
        try
        {
            await _auditLogService.LogAsync(
                "ApplicantScheduledAppointment",
                $"Applicant scheduled document submission appointment for application {app.ApplicationNumber} on {request.AppointmentDate:yyyy-MM-dd} at {request.AppointmentTime}.",
                userId?.ToString() ?? "Applicant",
                "Applicant");
        }
        catch { }

        // Notification for Registrar
        try
        {
            await _notificationService.CreateAsync(new CreateNotificationRequest
            {
                TargetRole = "Registrar",
                Title = "New Appointment Scheduled",
                Message = $"Applicant {app.FirstName} {app.LastName} ({app.ApplicationNumber}) scheduled a document submission appointment for {request.AppointmentDate:MMM dd, yyyy} at {request.AppointmentTime}.",
                Type = "Info"
            });
        }
        catch { }

        // Email to Applicant
        try
        {
            var bodyHtml = $@"<div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                <h2>Noah's Academy Incorporated</h2>
                <h3 style='color: #6b21a8;'>Document Submission Appointment Scheduled</h3>
                <p>Dear <strong>{app.FirstName} {app.LastName}</strong>,</p>
                <p>Your appointment for submitting original physical documents has been recorded.</p>
                <div style='background-color: #f4f0ff; padding: 15px; border-left: 4px solid #7e22ce; margin: 15px 0;'>
                    <p><strong>Application #:</strong> {app.ApplicationNumber}</p>
                    <p><strong>Appointment Date:</strong> {request.AppointmentDate:MMMM dd, yyyy}</p>
                    <p><strong>Appointment Time:</strong> {request.AppointmentTime}</p>
                    <p><strong>Location:</strong> Registrar's Office, Noah's Academy Campus</p>
                </div>
                <p>Please bring all original physical copies of your required documents (PSA Birth Certificate, Form 138 / Report Card, Good Moral Certificate, 2x2 Photo) for final verification.</p>
                <br/><p>Best regards,<br/><strong>Noah's Academy Registrar Office</strong></p>
            </div>";
            await _emailService.SendRawEmailAsync(app.Email, "Appointment Scheduled - Document Submission", bodyHtml);
        }
        catch { }

        return new AppointmentDto
        {
            Id = appointment.Id,
            EnrollmentApplicationId = app.Id,
            ApplicationNumber = app.ApplicationNumber,
            ApplicantName = $"{app.FirstName} {app.LastName}",
            GradeApplyingFor = app.GradeApplyingFor,
            Email = app.Email,
            PhoneNumber = app.PhoneNumber,
            AppointmentDate = appointment.AppointmentDate,
            AppointmentTime = appointment.AppointmentTime,
            Status = appointment.Status,
            Remarks = appointment.Remarks,
            CreatedAt = appointment.CreatedAt
        };
    }

    public async Task<AppointmentDto?> GetApplicationAppointmentAsync(int applicationId)
    {
        var app = await _context.EnrollmentApplications
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (app == null) return null;

        var apt = await _context.DocumentSubmissionAppointments
            .Where(a => a.EnrollmentApplicationId == applicationId)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync();

        if (apt == null) return null;

        return new AppointmentDto
        {
            Id = apt.Id,
            EnrollmentApplicationId = app.Id,
            ApplicationNumber = app.ApplicationNumber,
            ApplicantName = $"{app.FirstName} {app.LastName}",
            GradeApplyingFor = app.GradeApplyingFor,
            Email = app.Email,
            PhoneNumber = app.PhoneNumber,
            AppointmentDate = apt.AppointmentDate,
            AppointmentTime = apt.AppointmentTime,
            Status = apt.Status,
            Remarks = apt.Remarks,
            CreatedAt = apt.CreatedAt
        };
    }

    public async Task<List<AppointmentDto>> GetAppointmentQueueAsync(string? status, DateTime? date)
    {
        var query = _context.DocumentSubmissionAppointments
            .Include(a => a.EnrollmentApplication)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(a => a.Status.ToLower() == status.Trim().ToLower());
        }

        if (date.HasValue)
        {
            var dateOnly = date.Value.Date;
            query = query.Where(a => a.AppointmentDate.Date == dateOnly);
        }

        var appointments = await query
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .Select(apt => new AppointmentDto
            {
                Id = apt.Id,
                EnrollmentApplicationId = apt.EnrollmentApplicationId,
                ApplicationNumber = apt.EnrollmentApplication.ApplicationNumber,
                ApplicantName = $"{apt.EnrollmentApplication.FirstName} {apt.EnrollmentApplication.LastName}",
                GradeApplyingFor = apt.EnrollmentApplication.GradeApplyingFor,
                Email = apt.EnrollmentApplication.Email,
                PhoneNumber = apt.EnrollmentApplication.PhoneNumber,
                AppointmentDate = apt.AppointmentDate,
                AppointmentTime = apt.AppointmentTime,
                Status = apt.Status,
                Remarks = apt.Remarks,
                CreatedAt = apt.CreatedAt
            })
            .ToListAsync();

        return appointments;
    }

    public async Task<AppointmentDto> UpdateAppointmentStatusAsync(int appointmentId, UpdateAppointmentStatusDto request, int employeeId, string employeeRole)
    {
        var apt = await _context.DocumentSubmissionAppointments
            .Include(a => a.EnrollmentApplication)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (apt == null)
            throw new InvalidOperationException($"Appointment with ID {appointmentId} not found.");

        var app = apt.EnrollmentApplication;
        apt.Status = request.Status;
        apt.UpdatedAt = DateTime.UtcNow;
        apt.AssignedRegistrarId = employeeId;

        if (request.AppointmentDate.HasValue) apt.AppointmentDate = request.AppointmentDate.Value;
        if (!string.IsNullOrWhiteSpace(request.AppointmentTime)) apt.AppointmentTime = request.AppointmentTime;
        if (!string.IsNullOrWhiteSpace(request.Remarks)) apt.Remarks = request.Remarks;

        if (request.Status == "Confirmed")
        {
            // Audit Log
            try
            {
                await _auditLogService.LogAsync(
                    "RegistrarConfirmedAppointment",
                    $"Registrar confirmed document submission appointment for application {app.ApplicationNumber} on {apt.AppointmentDate:yyyy-MM-dd} at {apt.AppointmentTime}.",
                    employeeId.ToString(),
                    employeeRole);
            }
            catch { }

            // Notification
            try
            {
                await _notificationService.CreateAsync(new CreateNotificationRequest
                {
                    TargetRole = "Applicant",
                    Title = "Appointment Confirmed",
                    Message = $"Your document submission appointment for application {app.ApplicationNumber} on {apt.AppointmentDate:MMM dd, yyyy} at {apt.AppointmentTime} has been confirmed by the Registrar.",
                    Type = "Success"
                });
            }
            catch { }

            // Email
            try
            {
                var bodyHtml = $@"<div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2>Noah's Academy Incorporated</h2>
                    <h3 style='color: #047857;'>Appointment Confirmed</h3>
                    <p>Dear <strong>{app.FirstName} {app.LastName}</strong>,</p>
                    <p>Your appointment for original document verification has been <strong>CONFIRMED</strong> by the Registrar's Office.</p>
                    <div style='background-color: #ecfdf5; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0;'>
                        <p><strong>Appointment Date:</strong> {apt.AppointmentDate:MMMM dd, yyyy}</p>
                        <p><strong>Time Slot:</strong> {apt.AppointmentTime}</p>
                        <p><strong>Location:</strong> Registrar Office, Main Campus</p>
                    </div>
                    <br/><p>Best regards,<br/><strong>Noah's Academy Registrar Office</strong></p>
                </div>";
                await _emailService.SendRawEmailAsync(app.Email, "Appointment Confirmed - Registrar Office", bodyHtml);
            }
            catch { }
        }
        else if (request.Status == "Completed")
        {
            // Audit Log
            try
            {
                await _auditLogService.LogAsync(
                    "ApplicantCompletedAppointment",
                    $"Applicant completed document submission appointment for application {app.ApplicationNumber}.",
                    employeeId.ToString(),
                    employeeRole);
            }
            catch { }

            // Notification
            try
            {
                await _notificationService.CreateAsync(new CreateNotificationRequest
                {
                    TargetRole = "Applicant",
                    Title = "Appointment Completed",
                    Message = $"Your document submission appointment for application {app.ApplicationNumber} has been marked as Completed by the Registrar.",
                    Type = "Success"
                });
            }
            catch { }
        }
        else if (request.Status == "Rescheduled")
        {
            // Email & Notification for Rescheduled
            try
            {
                await _notificationService.CreateAsync(new CreateNotificationRequest
                {
                    TargetRole = "Applicant",
                    Title = "Appointment Rescheduled",
                    Message = $"Your document submission appointment for application {app.ApplicationNumber} has been rescheduled to {apt.AppointmentDate:MMM dd, yyyy} at {apt.AppointmentTime}.",
                    Type = "Warning"
                });
            }
            catch { }
        }

        await _context.SaveChangesAsync();

        return new AppointmentDto
        {
            Id = apt.Id,
            EnrollmentApplicationId = app.Id,
            ApplicationNumber = app.ApplicationNumber,
            ApplicantName = $"{app.FirstName} {app.LastName}",
            GradeApplyingFor = app.GradeApplyingFor,
            Email = app.Email,
            PhoneNumber = app.PhoneNumber,
            AppointmentDate = apt.AppointmentDate,
            AppointmentTime = apt.AppointmentTime,
            Status = apt.Status,
            Remarks = apt.Remarks,
            CreatedAt = apt.CreatedAt
        };
    }

    public async Task<VerificationSlipDto> GenerateVerificationSlipAsync(int applicationId, int employeeId, string employeeRole)
    {
        var app = await _context.EnrollmentApplications
            .Include(a => a.Documents)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (app == null)
            throw new InvalidOperationException($"Application with ID {applicationId} not found.");

        // Check if all required original documents are verified
        var requiredDocTypeIds = await _context.AdmissionDocumentTypes.Where(d => d.IsActive && d.IsRequired).Select(d => d.Id).ToListAsync();
        var unverifiedOriginals = app.Documents
            .Where(d => d.IsActive && d.AdmissionDocumentTypeId.HasValue && requiredDocTypeIds.Contains(d.AdmissionDocumentTypeId.Value) && d.OriginalStatus != "Verified")
            .ToList();

        if (unverifiedOriginals.Any())
        {
            throw new InvalidOperationException($"Cannot generate Registrar Verification Slip. Unverified physical original documents remaining: {string.Join(", ", unverifiedOriginals.Select(d => d.DocumentName))}.");
        }

        app.HasRegistrarVerificationSlip = true;
        app.VerificationSlipGeneratedAt = DateTime.UtcNow;

        if (string.IsNullOrEmpty(app.VerificationSlipNumber))
        {
            app.VerificationSlipNumber = $"REG-SLIP-{DateTime.UtcNow.Year}-{app.Id:D6}";
        }

        app.VerificationSlipQrCode = $"NAISIS-VERIFIED|APP:{app.ApplicationNumber}|SLIP:{app.VerificationSlipNumber}|DATE:{DateTime.UtcNow:yyyy-MM-dd}";
        app.Status = EnrollmentApplicationStatus.Approved;
        app.IsApproved = true;
        app.ApplicantRemarks = $"Registrar Verification Slip generated ({app.VerificationSlipNumber}). Eligible for Accounting Assessment.";
        app.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Audit Log
        try
        {
            await _auditLogService.LogAsync(
                "RegistrarGeneratedVerificationSlip",
                $"Registrar generated official verification slip {app.VerificationSlipNumber} for application {app.ApplicationNumber}.",
                employeeId.ToString(),
                employeeRole);
        }
        catch { }

        // Notification
        try
        {
            await _notificationService.CreateAsync(new CreateNotificationRequest
            {
                TargetRole = "Applicant",
                Title = "Registrar Verification Slip Issued",
                Message = $"Official Registrar Verification Slip {app.VerificationSlipNumber} has been generated for application {app.ApplicationNumber}. You are eligible for Accounting Assessment.",
                Type = "Success"
            });
        }
        catch { }

        var verifiedDocsList = app.Documents
            .Where(d => d.IsActive && d.OriginalStatus == "Verified")
            .Select(d => d.DocumentName)
            .ToList();

        return new VerificationSlipDto
        {
            ApplicationNumber = app.ApplicationNumber,
            ApplicantName = $"{app.FirstName} {app.LastName}",
            GradeLevel = app.GradeApplyingFor,
            SchoolYear = "SY 2026-2027",
            VerificationDate = app.VerificationSlipGeneratedAt.Value,
            VerificationSlipNumber = app.VerificationSlipNumber,
            QrCodeContent = app.VerificationSlipQrCode,
            VerifiedByRegistrarName = "Registrar Office",
            VerifiedDocuments = verifiedDocsList
        };
    }

    public async Task<VerificationSlipDto?> GetVerificationSlipAsync(int applicationId)
    {
        var app = await _context.EnrollmentApplications
            .Include(a => a.Documents)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (app == null || !app.HasRegistrarVerificationSlip) return null;

        var verifiedDocsList = app.Documents
            .Where(d => d.IsActive && d.OriginalStatus == "Verified")
            .Select(d => d.DocumentName)
            .ToList();

        return new VerificationSlipDto
        {
            ApplicationNumber = app.ApplicationNumber,
            ApplicantName = $"{app.FirstName} {app.LastName}",
            GradeLevel = app.GradeApplyingFor,
            SchoolYear = "SY 2026-2027",
            VerificationDate = app.VerificationSlipGeneratedAt ?? app.UpdatedAt ?? DateTime.UtcNow,
            VerificationSlipNumber = app.VerificationSlipNumber ?? $"REG-SLIP-{DateTime.UtcNow.Year}-{app.Id:D6}",
            QrCodeContent = app.VerificationSlipQrCode ?? $"NAISIS-VERIFIED|APP:{app.ApplicationNumber}",
            VerifiedByRegistrarName = "Registrar Office",
            VerifiedDocuments = verifiedDocsList
        };
    }

    private static EnrollmentApplicationDto MapToApplicationDto(EnrollmentApplication app)
    {
        return new EnrollmentApplicationDto
        {
            Id = app.Id,
            ApplicationNumber = app.ApplicationNumber,
            FirstName = app.FirstName,
            MiddleName = app.MiddleName,
            LastName = app.LastName,
            Suffix = app.Suffix,
            BirthDate = app.BirthDate,
            Gender = app.Gender.ToString(),
            Email = app.Email,
            PhoneNumber = app.PhoneNumber,
            Address = app.Address,
            ParentName = app.ParentName,
            ParentContact = app.ParentContact,
            ParentEmail = app.ParentEmail,
            Relationship = app.Relationship,

            PreviousSchool = app.PreviousSchool,
            GradeApplyingFor = app.GradeApplyingFor,
            Track = app.Track,
            Strand = app.Strand,
            Status = app.Status.ToString(),
            HasRegistrarVerificationSlip = app.HasRegistrarVerificationSlip,
            VerificationSlipNumber = app.VerificationSlipNumber,
            CreatedAt = app.CreatedAt,
            Documents = app.Documents != null
                ? app.Documents.Where(d => d.IsActive).Select(d => new ApplicationDocumentDto
                {
                    Id = d.Id,
                    AdmissionDocumentTypeId = d.AdmissionDocumentTypeId,
                    DocumentName = d.DocumentName ?? string.Empty,
                    Status = d.Status ?? string.Empty,
                    DigitalStatus = d.DigitalStatus,
                    OriginalStatus = d.OriginalStatus,
                    Remarks = d.Remarks,
                    OriginalRemarks = d.OriginalRemarks,
                    OriginalFilename = d.OriginalFilename,
                    ContentType = d.ContentType,
                    FileSize = d.FileSize,
                    UploadedAt = d.UploadedAt,
                    VerifiedAt = d.VerifiedAt,
                    OriginalSubmittedAt = d.OriginalSubmittedAt,
                    OriginalVerifiedAt = d.OriginalVerifiedAt,
                    Version = d.Version,
                    IsActive = d.IsActive,
                    DownloadUrl = !string.IsNullOrEmpty(d.StoredFilename) ? $"/api/Enrollment/documents/{d.Id}/download" : null,
                    PreviewUrl = !string.IsNullOrEmpty(d.StoredFilename) ? $"/api/Enrollment/documents/{d.Id}/preview" : null,
                }).ToList()
                : new List<ApplicationDocumentDto>()

        };
    }

    private static bool IsElementaryGradeLevel(string? gradeName)
    {
        if (string.IsNullOrWhiteSpace(gradeName)) return false;
        var g = gradeName.ToLower().Trim();

        // Parse numeric grade level first to prevent Grade 10, 11, 12 from matching 'grade 1' substring
        var match = System.Text.RegularExpressions.Regex.Match(g, @"\d+");
        if (match.Success && int.TryParse(match.Value, out var gradeNum))
        {
            return gradeNum >= 1 && gradeNum <= 6;
        }

        // Fallback keyword check for non-numeric grade names (e.g. Kinder, Nursery, Prep)
        if (g.Contains("kinder") || g.Contains("nursery") || g.Contains("prep") || g.Contains("elem"))
        {
            return true;
        }

        return false;
    }

    private static string FormatLrn(string? requestedLrn, string studentNumber)
    {
        if (!string.IsNullOrWhiteSpace(requestedLrn))
        {
            var trimmed = requestedLrn.Trim();
            if (trimmed.Length == 12 && trimmed.All(char.IsDigit))
            {
                return trimmed;
            }
            throw new InvalidOperationException("ENROLLMENT_PREREQUISITE_FAILED:Learner Reference Number (LRN) must be exactly 12 numeric digits.");
        }

        var digitsOnly = new string(studentNumber.Where(char.IsDigit).ToArray());
        if (string.IsNullOrEmpty(digitsOnly)) digitsOnly = "0";
        return digitsOnly.Length >= 12 ? digitsOnly.Substring(0, 12) : digitsOnly.PadLeft(12, '0');
    }
}