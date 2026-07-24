using EduCore.API.Data;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class NumberGeneratorService
{
    private readonly EduCoreDbContext _context;

    public NumberGeneratorService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerateEmployeeNumberAsync()
    {
        var count = await _context.Employees.CountAsync() + 1;

        return $"NAI-{count:D3}";
    }

    public async Task<string> GenerateStudentNumberAsync()
    {
        var year = DateTime.Now.Year;

        var count = await _context.Students.CountAsync() + 1;

        return $"NAI-{year}-{count:D6}";
    }

    public async Task<string> GenerateApplicationNumberAsync()
    {
        var year = DateTime.UtcNow.Year;

        var count = await _context.EnrollmentApplications.CountAsync() + 1;

        return $"APP-{year}-{count:D6}";
    }
}