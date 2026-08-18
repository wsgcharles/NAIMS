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
        // Use MAX(Id) instead of COUNT() to prevent duplicates when records are deleted
        var maxId = await _context.Employees.MaxAsync(e => (int?)e.Id) ?? 0;
        var seq = maxId + 1;
        return $"NAI-{seq:D3}";
    }

    public async Task<string> GenerateStudentNumberAsync()
    {
        var setting = await _context.SchoolSettings.FirstOrDefaultAsync();
        var prefix = string.IsNullOrWhiteSpace(setting?.StudentNumberPrefix) ? "NAI" : setting.StudentNumberPrefix.TrimEnd('-');
        var counterLen = (setting?.StudentNumberCounterLength > 0) ? setting.StudentNumberCounterLength : 6;

        var year = DateTime.UtcNow.Year;
        // Use MAX(Id) instead of COUNT() to prevent duplicates when records are deleted
        var maxId = await _context.Students.MaxAsync(s => (int?)s.Id) ?? 0;
        var seq = maxId + 1;

        var formattedCounter = seq.ToString().PadLeft(counterLen, '0');
        return $"{prefix}-{year}-{formattedCounter}";
    }

    public async Task<string> GenerateApplicationNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        // Use MAX(Id) instead of COUNT() to prevent duplicates when records are deleted
        var maxId = await _context.EnrollmentApplications.MaxAsync(a => (int?)a.Id) ?? 0;
        var seq = maxId + 1;
        return $"APP-{year}-{seq:D6}";
    }
}