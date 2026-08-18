using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class ClassScheduleService : IClassScheduleService
{
    private readonly EduCoreDbContext _context;

    public ClassScheduleService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<ClassScheduleResponse>> GetAllAsync()
    {
        var items = await Query().ToListAsync();
        return items.Select(MapToResponse).ToList();
    }

    public async Task<List<ClassScheduleResponse>> GetByTeachingAssignmentAsync(int teachingAssignmentId)
    {
        var items = await Query()
            .Where(s => s.TeachingAssignmentId == teachingAssignmentId)
            .ToListAsync();
        return items.Select(MapToResponse).ToList();
    }

    public async Task<List<ClassScheduleResponse>> GetByStudentIdAsync(int studentId)
    {
        var activeSectionId = await _context.StudentSectionAssignments
            .Where(a => a.StudentId == studentId && a.IsActive)
            .Select(a => (int?)a.SectionId)
            .FirstOrDefaultAsync();

        if (activeSectionId == null)
            return new List<ClassScheduleResponse>();

        var items = await Query()
            .Where(s => s.TeachingAssignment.SectionId == activeSectionId.Value && s.TeachingAssignment.IsActive)
            .ToListAsync();
        return items.Select(MapToResponse).ToList();
    }

    public async Task<List<ClassScheduleResponse>> GetByTeacherUserIdAsync(int userId)
    {
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
        if (employee == null)
            return new List<ClassScheduleResponse>();

        var items = await Query()
            .Where(s => s.TeachingAssignment.EmployeeId == employee.Id && s.TeachingAssignment.IsActive)
            .ToListAsync();
        return items.Select(MapToResponse).ToList();
    }


    public async Task<int?> GetStudentIdByUserIdAsync(int userId)
    {
        var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
        return student?.Id;
    }

    public async Task<ClassScheduleResponse> CreateAsync(CreateClassScheduleRequest request)
    {
        var teachingAssignment = await _context.TeachingAssignments
            .FirstOrDefaultAsync(t => t.Id == request.TeachingAssignmentId)
            ?? throw new InvalidOperationException("Teaching assignment not found.");

        if (!Enum.TryParse<DayOfWeek>(request.DayOfWeek, true, out var day))
            throw new InvalidOperationException($"Invalid day of week '{request.DayOfWeek}'.");

        if (request.EndTime <= request.StartTime)
            throw new InvalidOperationException("End time must be after start time.");

        var schedule = new ClassSchedule
        {
            TeachingAssignmentId = request.TeachingAssignmentId,
            DayOfWeek = day,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Room = request.Room,
            CreatedAt = DateTime.UtcNow
        };

        _context.Set<ClassSchedule>().Add(schedule);
        await _context.SaveChangesAsync();

        return (await GetByTeachingAssignmentAsync(request.TeachingAssignmentId))
            .First(s => s.Id == schedule.Id);
    }

    public async Task<ClassScheduleResponse?> UpdateAsync(int id, UpdateClassScheduleRequest request)
    {
        var schedule = await _context.Set<ClassSchedule>().FirstOrDefaultAsync(s => s.Id == id);
        if (schedule == null) return null;

        if (!Enum.TryParse<DayOfWeek>(request.DayOfWeek, true, out var day))
            throw new InvalidOperationException($"Invalid day of week '{request.DayOfWeek}'.");

        if (request.EndTime <= request.StartTime)
            throw new InvalidOperationException("End time must be after start time.");

        schedule.TeachingAssignmentId = request.TeachingAssignmentId;
        schedule.DayOfWeek = day;
        schedule.StartTime = request.StartTime;
        schedule.EndTime = request.EndTime;
        schedule.Room = request.Room;
        schedule.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetByTeachingAssignmentAsync(schedule.TeachingAssignmentId))
            .First(s => s.Id == schedule.Id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var schedule = await _context.Set<ClassSchedule>().FirstOrDefaultAsync(s => s.Id == id);
        if (schedule == null) return false;

        _context.Set<ClassSchedule>().Remove(schedule);
        await _context.SaveChangesAsync();
        return true;
    }

    private IQueryable<ClassSchedule> Query()
    {
        return _context.Set<ClassSchedule>()
            .Include(s => s.TeachingAssignment).ThenInclude(t => t.Subject)
            .Include(s => s.TeachingAssignment).ThenInclude(t => t.Employee)
            .Include(s => s.TeachingAssignment).ThenInclude(t => t.Section)
            .OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartTime);
    }

    private static ClassScheduleResponse MapToResponse(ClassSchedule s)
    {
        return new ClassScheduleResponse
        {
            Id = s.Id,
            TeachingAssignmentId = s.TeachingAssignmentId,
            SubjectName = s.TeachingAssignment.Subject.SubjectName,
            Teacher = $"{s.TeachingAssignment.Employee.FirstName} {s.TeachingAssignment.Employee.LastName}",
            Section = s.TeachingAssignment.Section.SectionName,
            DayOfWeek = s.DayOfWeek.ToString(),
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            Room = s.Room
        };
    }
}
