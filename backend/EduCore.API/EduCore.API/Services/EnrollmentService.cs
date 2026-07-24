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

    public EnrollmentService(
        EduCoreDbContext context,
        NumberGeneratorService numberGenerator,
        IPasswordService passwordService,
        IAccountingService accountingService,
        IPasswordPolicyService passwordPolicyService,
        IEmailService emailService)
    {
        _context = context;
        _numberGenerator = numberGenerator;
        _passwordService = passwordService;
        _accountingService = accountingService;
        _passwordPolicyService = passwordPolicyService;
        _emailService = emailService;
    }

    public async Task<EnrollmentResponse> CreateAsync(CreateEnrollmentRequest request)
    {
        var applicationNumber =
            await _numberGenerator.GenerateApplicationNumberAsync();

        var application = new EnrollmentApplication
        {
            ApplicationNumber = applicationNumber,

            FirstName = request.FirstName,
            MiddleName = request.MiddleName,
            LastName = request.LastName,
            Suffix = request.Suffix,

            BirthDate = DateTime.SpecifyKind(
                request.BirthDate,
                DateTimeKind.Utc),

            Gender = Enum.Parse<EduCore.API.Enums.Gender>(request.Gender, true),

            Email = request.Email,
            PhoneNumber = request.PhoneNumber,

            Address = request.Address,
            Barangay = request.Barangay,
            City = request.City,
            Province = request.Province,

            ParentName = request.ParentName,
            ParentContact = request.ParentContact,
            Relationship = request.Relationship,

            PreviousSchool = request.PreviousSchool,
            GradeApplyingFor = request.GradeApplyingFor,

            Status = EnrollmentApplicationStatus.Pending,
            IsApproved = false,

            CreatedAt = DateTime.UtcNow
        };

        _context.EnrollmentApplications.Add(application);

        await _context.SaveChangesAsync();

        return MapToResponse(application);
    }

    public async Task<List<EnrollmentResponse>> GetAllAsync()
    {
        return await _context.EnrollmentApplications
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new EnrollmentResponse
            {
                Id = x.Id,
                ApplicationNumber = x.ApplicationNumber,
                FullName = $"{x.FirstName} {x.LastName}",
                GradeApplyingFor = x.GradeApplyingFor,
                PreviousSchool = x.PreviousSchool,
                Email = x.Email,
                Status = x.Status.ToString(),
                IsApproved = x.IsApproved,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<EnrollmentResponse?> GetByIdAsync(int id)
    {
        var application = await _context.EnrollmentApplications
            .FirstOrDefaultAsync(x => x.Id == id);

        if (application == null)
            return null;

        return MapToResponse(application);
    }

    public async Task<EnrollmentResponse?> UpdateAsync(
        int id,
        UpdateEnrollmentRequest request)
    {
        var application = await _context.EnrollmentApplications
            .FirstOrDefaultAsync(x => x.Id == id);

        if (application == null)
            return null;

        application.FirstName = request.FirstName;
        application.MiddleName = request.MiddleName;
        application.LastName = request.LastName;
        application.Suffix = request.Suffix;

        application.BirthDate = DateTime.SpecifyKind(
            request.BirthDate,
            DateTimeKind.Utc);

        application.Gender = Enum.Parse<EduCore.API.Enums.Gender>(request.Gender, true);

        application.Email = request.Email;
        application.PhoneNumber = request.PhoneNumber;

        application.Address = request.Address;
        application.Barangay = request.Barangay;
        application.City = request.City;
        application.Province = request.Province;

        application.ParentName = request.ParentName;
        application.ParentContact = request.ParentContact;
        application.Relationship = request.Relationship;

        application.PreviousSchool = request.PreviousSchool;
        application.GradeApplyingFor = request.GradeApplyingFor;

        application.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var application = await _context.EnrollmentApplications
            .FirstOrDefaultAsync(x => x.Id == id);

        if (application == null)
            return false;

        _context.EnrollmentApplications.Remove(application);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ApproveAsync(int id)
    {
        var application = await _context.EnrollmentApplications
            .FirstOrDefaultAsync(x => x.Id == id);

        if (application == null)
            return false;

        application.Status = EnrollmentApplicationStatus.Approved;
        application.IsApproved = true;
        application.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RejectAsync(int id)
    {
        var application = await _context.EnrollmentApplications
            .FirstOrDefaultAsync(x => x.Id == id);

        if (application == null)
            return false;

        application.Status = EnrollmentApplicationStatus.Rejected;
        application.IsApproved = false;
        application.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Full enrollment pipeline:
    /// 1. Validates the application is still Pending.
    /// 2. Checks for duplicate email/LRN in the system.
    /// 3. Creates a User account (Student role, temporary password, MustChangePassword = true).
    /// 4. Creates the Student record using data from the application.
    /// 5. Marks the application as Approved.
    /// 6. Logs the event to the student's history.
    /// Returns the student number and temporary password for the Registrar to hand over.
    /// </summary>
    public async Task<ApproveAndEnrollResponse> ApproveAndEnrollAsync(
        int applicationId,
        ApproveAndEnrollRequest request)
    {
        var application = await _context.EnrollmentApplications
            .FirstOrDefaultAsync(x => x.Id == applicationId)
            ?? throw new InvalidOperationException("Enrollment application not found.");

        if (application.Status != EnrollmentApplicationStatus.Pending)
            throw new InvalidOperationException(
                $"This application cannot be processed. Current status: {application.Status}.");

        var section = await _context.Sections
            .FirstOrDefaultAsync(x => x.Id == request.SectionId)
            ?? throw new InvalidOperationException("Section not found.");

        // Guard: email must not already belong to a user or student
        if (await _context.Users.AnyAsync(u => u.Email == application.Email))
            throw new InvalidOperationException(
                "An account with this email address already exists in the system.");

        if (await _context.Students.AnyAsync(s => s.Email == application.Email))
            throw new InvalidOperationException(
                "A student record with this email already exists in the system.");

        // Guard: LRN uniqueness
        if (await _context.Students.AnyAsync(s => s.LRN == request.LRN))
            throw new InvalidOperationException(
                "The provided LRN is already registered to another student.");

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // ── Step 1: Create User account ─────────────────────────────────────
            var temporaryPassword = _passwordPolicyService.GenerateRandomPassword(10);

            var user = new User
            {
                Email = application.Email,
                PasswordHash = _passwordService.HashPassword(temporaryPassword),
                Role = UserRole.Student,
                IsActive = true,
                IsEmailVerified = false,
                MustChangePassword = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(); // Flush to get user.Id

            var studentNumber = await _numberGenerator.GenerateStudentNumberAsync();

            // ── Step 2: Parent and Parent User Creation ────────────────────────
            var parentFirstName = string.IsNullOrWhiteSpace(application.ParentName) ? "Unknown" : application.ParentName.Split(' ').First();
            var parentLastName = string.IsNullOrWhiteSpace(application.ParentName) || application.ParentName.Split(' ').Length == 1 ? "Unknown" : string.Join(" ", application.ParentName.Split(' ').Skip(1));
            var parentPhone = application.ParentContact ?? string.Empty;

            var parent = await _context.Parents
                .FirstOrDefaultAsync(p => 
                    p.FirstName.ToLower() == parentFirstName.ToLower() && 
                    p.LastName.ToLower() == parentLastName.ToLower() &&
                    p.PhoneNumber == parentPhone);

            string parentTemporaryPassword = string.Empty;
            string parentEmail = string.Empty;

            if (parent == null)
            {
                parent = new Parent
                {
                    FirstName = parentFirstName,
                    LastName = parentLastName,
                    PhoneNumber = parentPhone,
                    RelationshipToStudent = application.Relationship ?? "Unknown",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
                _context.Parents.Add(parent);
                await _context.SaveChangesAsync(); // Flush to get Parent Id
            }

            if (parent.UserId == null)
            {
                parentTemporaryPassword = _passwordPolicyService.GenerateRandomPassword(10);
                parentEmail = !string.IsNullOrWhiteSpace(parent.Email) 
                    ? parent.Email 
                    : $"p{studentNumber}@educore.local";

                if (await _context.Users.AnyAsync(u => u.Email == parentEmail))
                {
                    parentEmail = $"p{studentNumber}_{Guid.NewGuid().ToString().Substring(0, 4)}@educore.local";
                }

                var parentUser = new User
                {
                    Email = parentEmail,
                    PasswordHash = _passwordService.HashPassword(parentTemporaryPassword),
                    Role = UserRole.Parent,
                    IsActive = true,
                    IsEmailVerified = false,
                    MustChangePassword = true,
                    CreatedAt = DateTime.UtcNow
                };
                
                _context.Users.Add(parentUser);
                await _context.SaveChangesAsync(); // Flush to get User Id

                parent.UserId = parentUser.Id;
                parent.Email = parentEmail;
                await _context.SaveChangesAsync();
            }

            // ── Step 3: Create Student record ───────────────────────────────────
            var student = new Student
            {
                UserId = user.Id,
                StudentNumber = studentNumber,
                LRN = request.LRN,

                FirstName = application.FirstName,
                MiddleName = application.MiddleName ?? string.Empty,
                LastName = application.LastName,
                Suffix = application.Suffix ?? string.Empty,

                BirthDate = application.BirthDate,
                Gender = application.Gender,

                Email = application.Email,
                PhoneNumber = application.PhoneNumber,

                Address = application.Address,
                Barangay = application.Barangay,
                City = application.City,
                Province = application.Province,

                ParentId = parent.Id,
                Parent = parent,

                Status = StudentStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync(); // Flush to get student.Id

            // ── Step 4: Create Enrollment and Section Assignment ─────────────
            var enrollment = new Enrollment
            {
                EnrollmentNumber = $"ENR-{studentNumber}-{DateTime.UtcNow.Year}",
                StudentId = student.Id,
                SectionId = request.SectionId,
                EnrollmentType = request.EnrollmentType,
                Status = EnrollmentStatus.Enrolled,
                EnrollmentDate = DateTime.UtcNow,
                ApprovedByEmployeeId = request.EmployeeId,
                Remarks = $"Enrolled via Application {application.ApplicationNumber}",
                CreatedAt = DateTime.UtcNow
            };

            _context.Enrollments.Add(enrollment);

            var sectionAssignment = new StudentSectionAssignment
            {
                StudentId = student.Id,
                SectionId = request.SectionId,
                AssignedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.StudentSectionAssignments.Add(sectionAssignment);
            await _context.SaveChangesAsync();

            // ── Step 5: Generate Student Bill ─────────────────────────────────
            await _accountingService.GenerateBillForEnrollmentAsync(enrollment.Id);

            // ── Step 6: Approve the application ────────────────────────────────
            application.Status = EnrollmentApplicationStatus.Approved;
            application.IsApproved = true;
            application.UpdatedAt = DateTime.UtcNow;

            // ── Step 6: Log history ─────────────────────────────────────────────
            var history = new StudentHistory
            {
                StudentId = student.Id,
                Action = "Enrolled",
                Description =
                    $"Student account created via enrollment application {application.ApplicationNumber}. " +
                    $"Assigned to Section {section.SectionName}. Previous school: {application.PreviousSchool}.",
                EmployeeId = request.EmployeeId,
                DateOccurred = DateTime.UtcNow
            };

            _context.StudentHistories.Add(history);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            // Queue Student Welcome Email
            await _emailService.QueueEmailAsync(
                student.Email,
                "Welcome to Noah's Academy - Student Account Enrolled",
                "StudentWelcome",
                new StudentWelcomeEmailViewModel
                {
                    StudentName = $"{student.FirstName} {student.LastName}",
                    StudentNumber = studentNumber,
                    Username = student.Email,
                    TemporaryPassword = temporaryPassword,
                    GradeLevel = application.GradeApplyingFor,
                    SectionName = section.SectionName,
                    LoginUrl = "https://portal.noahsacademy.edu.ph/login"
                });

            // Queue Parent Welcome Email if new parent account was created
            if (!string.IsNullOrWhiteSpace(parentTemporaryPassword))
            {
                await _emailService.QueueEmailAsync(
                    parentEmail,
                    "Noah's Academy - Parent Portal Account Details",
                    "ParentWelcome",
                    new ParentWelcomeEmailViewModel
                    {
                        ParentName = $"{parent.FirstName} {parent.LastName}",
                        Username = parentEmail,
                        TemporaryPassword = parentTemporaryPassword,
                        StudentName = $"{student.FirstName} {student.LastName}",
                        Relationship = parent.RelationshipToStudent,
                        LoginUrl = "https://portal.noahsacademy.edu.ph/login"
                    });
            }

            return new ApproveAndEnrollResponse
            {
                StudentId = student.Id,
                StudentNumber = studentNumber,
                FullName = $"{student.FirstName} {student.LastName}",
                Email = student.Email,
                TemporaryPassword = temporaryPassword,
                ParentEmail = parentEmail,
                ParentTemporaryPassword = parentTemporaryPassword,
                ApplicationNumber = application.ApplicationNumber,
                Message = "Student enrolled successfully. Please share the temporary passwords securely with the student and parent."
            };
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private static EnrollmentResponse MapToResponse(EnrollmentApplication application)
    {
        return new EnrollmentResponse
        {
            Id = application.Id,
            ApplicationNumber = application.ApplicationNumber,
            FullName = $"{application.FirstName} {application.LastName}",
            GradeApplyingFor = application.GradeApplyingFor,
            PreviousSchool = application.PreviousSchool,
            Email = application.Email,
            Status = application.Status.ToString(),
            IsApproved = application.IsApproved,
            CreatedAt = application.CreatedAt
        };
    }

    private static string GenerateTemporaryPassword()
    {
        const string chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";

        var random = new Random();

        return new string(
            Enumerable.Repeat(chars, 10)
                .Select(s => s[random.Next(s.Length)])
                .ToArray());
    }
}