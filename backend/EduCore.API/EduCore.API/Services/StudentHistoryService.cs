using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class StudentHistoryService : IStudentHistoryService
{
    private readonly EduCoreDbContext _context;

    public StudentHistoryService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task AddHistoryAsync(CreateStudentHistoryRequest request)
    {
        var history = new StudentHistory
        {
            StudentId = request.StudentId,
            Action = request.Action,
            Description = request.Description,
            EmployeeId = request.EmployeeId,
            DateOccurred = DateTime.UtcNow
        };

        _context.StudentHistories.Add(history);

        await _context.SaveChangesAsync();
    }

    public async Task<List<StudentHistoryResponse>> GetByStudentIdAsync(int studentId)
    {
        return await _context.StudentHistories
            .Include(x => x.Employee)
            .Where(x => x.StudentId == studentId)
            .OrderByDescending(x => x.DateOccurred)
            .Select(x => new StudentHistoryResponse
            {
                Id = x.Id,
                StudentId = x.StudentId,
                Action = x.Action,
                Description = x.Description,
                DateOccurred = x.DateOccurred,
                EmployeeId = x.EmployeeId,
                PerformedBy = x.Employee != null ? x.Employee.FirstName + " " + x.Employee.LastName : "System"
            })
            .ToListAsync();
    }
}
