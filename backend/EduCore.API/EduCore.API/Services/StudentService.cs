using EduCore.API.Data;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
namespace EduCore.API.Services;

public class StudentService : IStudentService
{
    private readonly EduCoreDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IStudentHistoryService _historyService;
    private readonly IAuditLogService _auditLogService;

    public StudentService(
    EduCoreDbContext context,
    IPasswordService passwordService,
    IStudentHistoryService historyService,
    IAuditLogService auditLogService)
    {
        _context = context;
        _passwordService = passwordService;
        _historyService = historyService;
        _auditLogService = auditLogService;
    }
    public async Task<List<StudentResponse>> GetAllAsync()
    {
        return await _context.Students
            .OrderBy(s => s.LastName)
            .ThenBy(s => s.FirstName)
            .Select(s => new StudentResponse
            {
                Id = s.Id,
                StudentNumber = s.StudentNumber,
                LRN = s.LRN,
                FullName = $"{s.FirstName} {s.LastName}",
                FirstName = s.FirstName,
                MiddleName = s.MiddleName,
                LastName = s.LastName,
                Suffix = s.Suffix,
                BirthDate = s.BirthDate,
                Gender = s.Gender.ToString(),
                Email = s.Email,
                PhoneNumber = s.PhoneNumber,
                Address = s.Address,
                Barangay = s.Barangay,
                City = s.City,
                Province = s.Province,
                ParentId = s.ParentId,
                IsActive = s.Status == EduCore.API.Enums.StudentStatus.Active
            })
            .ToListAsync();
    }

    public async Task<StudentResponse?> GetByIdAsync(int id)
    {
        var student = await _context.Students.FindAsync(id);

        if (student == null)
            return null;

        return new StudentResponse
        {
            Id = student.Id,
            StudentNumber = student.StudentNumber,
            LRN = student.LRN,
            FullName = $"{student.FirstName} {student.LastName}",
            FirstName = student.FirstName,
            MiddleName = student.MiddleName,
            LastName = student.LastName,
            Suffix = student.Suffix,
            BirthDate = student.BirthDate,
            Gender = student.Gender.ToString(),
            Email = student.Email,
            PhoneNumber = student.PhoneNumber,
            Address = student.Address,
            Barangay = student.Barangay,
            City = student.City,
            Province = student.Province,
            ParentId = student.ParentId,
            IsActive = student.Status == EduCore.API.Enums.StudentStatus.Active
        };
    }

        public async Task<StudentResponse> CreateAsync(CreateStudentRequest request)
        {
            if (await _context.Students.AnyAsync(s => s.LRN == request.LRN))
                throw new Exception("LRN already exists.");

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                throw new Exception("Email already exists.");

            var temporaryPassword = GenerateTemporaryPassword();

            var user = new User
            {
                Email = request.Email,
                PasswordHash = _passwordService.HashPassword(temporaryPassword),
                Role = UserRole.Student,
                IsActive = true,
                IsEmailVerified = false,
                MustChangePassword = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            var student = new Student
            {
                UserId = user.Id,

                StudentNumber = await GenerateStudentNumber(),

                LRN = request.LRN,

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

                ParentId = request.ParentId,

                Status = EduCore.API.Enums.StudentStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            _context.Students.Add(student);

        await _historyService.AddHistoryAsync(new CreateStudentHistoryRequest
        {
            StudentId = student.Id,
            Action = "Student Created",
            Description = $"Student account created with Student Number {student.StudentNumber}.",
            EmployeeId = null
        });

        await _context.SaveChangesAsync();

            await _auditLogService.LogAsync("Student.Create", "Student", student.Id.ToString(), $"Created student {student.FirstName} {student.LastName} ({student.StudentNumber}).");

            return new StudentResponse
            {
                Id = student.Id,
                StudentNumber = student.StudentNumber,
                LRN = student.LRN,
                FullName = $"{student.FirstName} {student.LastName}",
                FirstName = student.FirstName,
                MiddleName = student.MiddleName,
                LastName = student.LastName,
                Suffix = student.Suffix,
                BirthDate = student.BirthDate,
                Gender = student.Gender.ToString(),
                Email = student.Email,
                PhoneNumber = student.PhoneNumber,
                Address = student.Address,
                Barangay = student.Barangay,
                City = student.City,
                Province = student.Province,
                ParentId = student.ParentId,
                IsActive = student.Status == EduCore.API.Enums.StudentStatus.Active,

                TemporaryPassword = temporaryPassword
            };
    }

    public async Task<StudentResponse?> UpdateAsync(int id, UpdateStudentRequest request)
    {
        var student = await _context.Students.FindAsync(id);

        if (student == null)
            return null;

        student.LRN = request.LRN;
        student.FirstName = request.FirstName;
        student.MiddleName = request.MiddleName;
        student.LastName = request.LastName;
        student.Suffix = request.Suffix;

      
        student.BirthDate = DateTime.SpecifyKind(request.BirthDate, DateTimeKind.Utc);

        student.Gender = Enum.Parse<EduCore.API.Enums.Gender>(request.Gender, true);
        student.Email = request.Email;
        student.PhoneNumber = request.PhoneNumber;
        student.Address = request.Address;
        student.Barangay = request.Barangay;
        student.City = request.City;
        student.Province = request.Province;
        student.ParentId = request.ParentId;

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("Student.Update", "Student", student.Id.ToString(), $"Updated student {student.FirstName} {student.LastName}.");

        return new StudentResponse
        {
            Id = student.Id,
            StudentNumber = student.StudentNumber,
            LRN = student.LRN,
            FullName = $"{student.FirstName} {student.LastName}",
            FirstName = student.FirstName,
            MiddleName = student.MiddleName,
            LastName = student.LastName,
            Suffix = student.Suffix,
            BirthDate = student.BirthDate,
            Gender = student.Gender.ToString(),
            Email = student.Email,
            PhoneNumber = student.PhoneNumber,
            Address = student.Address,
            Barangay = student.Barangay,
            City = student.City,
            Province = student.Province,
            ParentId = student.ParentId,
            IsActive = student.Status == EduCore.API.Enums.StudentStatus.Active
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var student = await _context.Students.FindAsync(id);

        if (student == null)
            return false;

        _context.Students.Remove(student);

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("Student.Delete", "Student", id.ToString(), $"Deleted student {student.FirstName} {student.LastName}.");

        return true;
    }

    public async Task<bool> ToggleStatusAsync(int id)
    {
        var student = await _context.Students.FindAsync(id);

        if (student == null)
            return false;

        student.Status = student.Status == EduCore.API.Enums.StudentStatus.Active
            ? EduCore.API.Enums.StudentStatus.Inactive
            : EduCore.API.Enums.StudentStatus.Active;

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("Student.ToggleStatus", "Student", id.ToString(), $"Student {student.FirstName} {student.LastName} set to {student.Status}.");

        return true;
    }

    private async Task<string> GenerateStudentNumber()
    {
        var year = DateTime.Now.Year;

        var count = await _context.Students.CountAsync() + 1;

        return $"NAI-{year}-{count:D6}";
    }

    private string GenerateTemporaryPassword()
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