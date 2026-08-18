using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class EmployeeService : IEmployeeService
{
    private readonly EduCoreDbContext _context;
    private readonly NumberGeneratorService _numberGenerator;
    private readonly IPasswordService _passwordService;
    private readonly IPasswordPolicyService _passwordPolicyService;
    private readonly IEmailService _emailService;
    private readonly IAuditLogService _auditLogService;

    public EmployeeService(
        EduCoreDbContext context,
        NumberGeneratorService numberGenerator,
        IPasswordService passwordService,
        IPasswordPolicyService passwordPolicyService,
        IEmailService emailService,
        IAuditLogService auditLogService)
    {
        _context = context;
        _numberGenerator = numberGenerator;
        _passwordService = passwordService;
        _passwordPolicyService = passwordPolicyService;
        _emailService = emailService;
        _auditLogService = auditLogService;
    }

    public async Task<EmployeeResponse> CreateAsync(CreateEmployeeRequest request)
    {
        if (await _context.Users.AnyAsync(x => x.Email == request.Email))
            throw new Exception("Email already exists.");

        var employeeNumber =
            await _numberGenerator.GenerateEmployeeNumberAsync();

        var temporaryPassword =
            _passwordPolicyService.GenerateRandomPassword(10);

        var role =
            GetRoleFromPosition(request.Position);

        var department =
            GetDepartmentFromPosition(request.Position);

        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordService.HashPassword(temporaryPassword),
            Role = role,
            IsActive = true,
            IsEmailVerified = false,
            MustChangePassword = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        var employee = new Employee
        {
            EmployeeNumber = employeeNumber,

            FirstName = request.FirstName,
            MiddleName = request.MiddleName,
            LastName = request.LastName,
            Suffix = request.Suffix,

            BirthDate = DateTime.SpecifyKind(
    request.BirthDate,
    DateTimeKind.Utc),
            Gender = request.Gender,

            Email = request.Email,
            PhoneNumber = request.PhoneNumber,

            Address = request.Address,
            Barangay = request.Barangay,
            City = request.City,
            Province = request.Province,

            Department = department,
            Position = request.Position,

            Role = role,

            DateHired = DateTime.SpecifyKind(
    request.DateHired,
    DateTimeKind.Utc),

            UserId = user.Id,

            IsActive = true,

            CreatedAt = DateTime.UtcNow
        };

        _context.Employees.Add(employee);

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("Employee.Create", "Employee", employee.Id.ToString(), $"Created employee {employee.FirstName} {employee.LastName} ({employee.Position}).");

        // Queue Welcome Email
        await _emailService.QueueEmailAsync(
            user.Email,
            "Welcome to Noah's Academy - Staff Account Created",
            "EmployeeWelcome",
            new EmployeeWelcomeEmailViewModel
            {
                EmployeeName = $"{employee.FirstName} {employee.LastName}",
                Username = user.Email,
                TemporaryPassword = temporaryPassword,
                Role = role.ToString(),
                LoginUrl = "https://portal.noahsacademy.edu.ph/login"
            });

        return new EmployeeResponse
        {
            Id = employee.Id,
            EmployeeNumber = employee.EmployeeNumber,
            FullName = $"{employee.FirstName} {employee.LastName}",
            FirstName = employee.FirstName,
            MiddleName = employee.MiddleName,
            LastName = employee.LastName,
            Suffix = employee.Suffix,
            BirthDate = employee.BirthDate,
            Gender = employee.Gender,
            Address = employee.Address,
            Barangay = employee.Barangay,
            City = employee.City,
            Province = employee.Province,
            Position = employee.Position,
            Department = employee.Department,
            Role = employee.Role.ToString(),
            Email = employee.Email,
            PhoneNumber = employee.PhoneNumber,
            DateHired = employee.DateHired,
            IsActive = employee.IsActive,

            TemporaryPassword = temporaryPassword


        };
    }

    public async Task<List<EmployeeResponse>> GetAllAsync()
    {
        return await _context.Employees
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .Select(e => new EmployeeResponse
            {
                Id = e.Id,
                EmployeeNumber = e.EmployeeNumber,
                FullName = $"{e.FirstName} {e.LastName}",
                FirstName = e.FirstName,
                MiddleName = e.MiddleName,
                LastName = e.LastName,
                Suffix = e.Suffix,
                BirthDate = e.BirthDate,
                Gender = e.Gender,
                Address = e.Address,
                Barangay = e.Barangay,
                City = e.City,
                Province = e.Province,
                Position = e.Position,
                Department = e.Department,
                Role = e.Role.ToString(),
                Email = e.Email,
                PhoneNumber = e.PhoneNumber,
                DateHired = e.DateHired,
                IsActive = e.IsActive
            })
            .ToListAsync();
    }

    public async Task<EmployeeResponse?> GetByIdAsync(int id)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return null;

        return new EmployeeResponse
        {
            Id = employee.Id,
            EmployeeNumber = employee.EmployeeNumber,
            FullName = $"{employee.FirstName} {employee.LastName}",
            FirstName = employee.FirstName,
            MiddleName = employee.MiddleName,
            LastName = employee.LastName,
            Suffix = employee.Suffix,
            BirthDate = employee.BirthDate,
            Gender = employee.Gender,
            Address = employee.Address,
            Barangay = employee.Barangay,
            City = employee.City,
            Province = employee.Province,
            Position = employee.Position,
            Department = employee.Department,
            Role = employee.Role.ToString(),
            Email = employee.Email,
            PhoneNumber = employee.PhoneNumber,
            DateHired = employee.DateHired,
            IsActive = employee.IsActive
        };
    }

    public async Task<EmployeeResponse?> UpdateAsync(
        int id,
        UpdateEmployeeRequest request)
    {
        var employee = await _context.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return null;

        employee.FirstName = request.FirstName;
        employee.MiddleName = request.MiddleName;
        employee.LastName = request.LastName;
        employee.Suffix = request.Suffix;

        employee.BirthDate = DateTime.SpecifyKind(
    request.BirthDate,
    DateTimeKind.Utc);
        employee.Gender = request.Gender;

        employee.Email = request.Email;
        employee.PhoneNumber = request.PhoneNumber;

        employee.Address = request.Address;
        employee.Barangay = request.Barangay;
        employee.City = request.City;
        employee.Province = request.Province;

        employee.Position = request.Position;
        employee.Department = GetDepartmentFromPosition(request.Position);
        employee.Role = GetRoleFromPosition(request.Position);

        employee.DateHired = DateTime.SpecifyKind(
     request.DateHired,
     DateTimeKind.Utc);
        employee.UpdatedAt = DateTime.UtcNow;

        if (employee.User != null)
        {
            employee.User.Email = request.Email;
            employee.User.Role = employee.Role;
        }

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("Employee.Update", "Employee", employee.Id.ToString(), $"Updated employee {employee.FirstName} {employee.LastName}.");

        return new EmployeeResponse
        {
            Id = employee.Id,
            EmployeeNumber = employee.EmployeeNumber,
            FullName = $"{employee.FirstName} {employee.LastName}",
            FirstName = employee.FirstName,
            MiddleName = employee.MiddleName,
            LastName = employee.LastName,
            Suffix = employee.Suffix,
            BirthDate = employee.BirthDate,
            Gender = employee.Gender,
            Address = employee.Address,
            Barangay = employee.Barangay,
            City = employee.City,
            Province = employee.Province,
            Position = employee.Position,
            Department = employee.Department,
            Role = employee.Role.ToString(),
            Email = employee.Email,
            PhoneNumber = employee.PhoneNumber,
            DateHired = employee.DateHired,
            IsActive = employee.IsActive
        };
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var employee = await _context.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return false;

        if (employee.User != null)
        {
            _context.Users.Remove(employee.User);
        }

        _context.Employees.Remove(employee);

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("Employee.Delete", "Employee", id.ToString(), $"Deleted employee {employee.FirstName} {employee.LastName}.");

        return true;
    }

    public async Task<bool> ToggleStatusAsync(int id)
    {
        var employee = await _context.Employees
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return false;

        employee.IsActive = !employee.IsActive;

        if (employee.User != null)
        {
            employee.User.IsActive = employee.IsActive;
        }

        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync("Employee.ToggleStatus", "Employee", id.ToString(), $"Employee {employee.FirstName} {employee.LastName} set to {(employee.IsActive ? "Active" : "Inactive")}.");

        return true;
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

    private UserRole GetRoleFromPosition(string position)
    {
        return position.Trim().ToLower() switch
        {
            "administrator" => UserRole.Administrator,
            "principal" => UserRole.Principal,
            "registrar" => UserRole.Registrar,
            "teacher" => UserRole.Teacher,
            "accountant" => UserRole.Accountant,

            _ => throw new Exception("Invalid employee position.")
        };
    }

    private string GetDepartmentFromPosition(string position)
    {
        return position.Trim().ToLower() switch
        {
            "administrator" => "Administration",
            "principal" => "Administration",
            "registrar" => "Registrar Office",
            "teacher" => "Academic Affairs",
            "accountant" => "Finance Office",

            _ => "Administration"
        };
    }
}