using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Enums;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class AttendanceService : IAttendanceService
{
    private readonly EduCoreDbContext _context;

    public AttendanceService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<AttendanceRosterEntryResponse>> GetRosterAsync(int teachingAssignmentId, DateTime date)
    {
        var teachingAssignment = await _context.TeachingAssignments
            .FirstOrDefaultAsync(t => t.Id == teachingAssignmentId)
            ?? throw new InvalidOperationException("Teaching assignment not found.");

        var day = date.Date;

        var roster = await _context.StudentSectionAssignments
            .Include(a => a.Student)
            .Where(a => a.SectionId == teachingAssignment.SectionId && a.IsActive)
            .OrderBy(a => a.Student.LastName)
            .ThenBy(a => a.Student.FirstName)
            .Select(a => new { a.StudentId, a.Student.FirstName, a.Student.LastName })
            .ToListAsync();

        var existing = await _context.Set<Attendance>()
            .Where(x => x.TeachingAssignmentId == teachingAssignmentId && x.Date == day)
            .ToDictionaryAsync(x => x.StudentId);

        return roster.Select(r => new AttendanceRosterEntryResponse
        {
            StudentId = r.StudentId,
            StudentName = $"{r.FirstName} {r.LastName}",
            Status = existing.TryGetValue(r.StudentId, out var record) ? record.Status.ToString() : null,
            Remarks = existing.TryGetValue(r.StudentId, out var rec2) ? rec2.Remarks : null
        }).ToList();
    }

    public async Task<List<AttendanceResponse>> SubmitAsync(SubmitAttendanceRequest request)
    {
        var teachingAssignment = await _context.TeachingAssignments
            .FirstOrDefaultAsync(t => t.Id == request.TeachingAssignmentId)
            ?? throw new InvalidOperationException("Teaching assignment not found.");

        var employeeExists = await _context.Employees.AnyAsync(e => e.Id == request.RecordedByEmployeeId);
        if (!employeeExists)
            throw new InvalidOperationException("Recording employee not found.");

        var day = request.Date.Date;

        var existingRecords = await _context.Set<Attendance>()
            .Where(x => x.TeachingAssignmentId == request.TeachingAssignmentId && x.Date == day)
            .ToDictionaryAsync(x => x.StudentId);

        foreach (var entry in request.Entries)
        {
            if (!Enum.TryParse<AttendanceStatus>(entry.Status, true, out var status))
                throw new InvalidOperationException($"Invalid attendance status '{entry.Status}'.");

            if (existingRecords.TryGetValue(entry.StudentId, out var record))
            {
                record.Status = status;
                record.Remarks = entry.Remarks;
                record.RecordedByEmployeeId = request.RecordedByEmployeeId;
                record.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.Set<Attendance>().Add(new Attendance
                {
                    TeachingAssignmentId = request.TeachingAssignmentId,
                    StudentId = entry.StudentId,
                    Date = day,
                    Status = status,
                    Remarks = entry.Remarks,
                    RecordedByEmployeeId = request.RecordedByEmployeeId,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();

        var list1 = await _context.Set<Attendance>()
            .Include(a => a.Student)
            .Include(a => a.TeachingAssignment).ThenInclude(t => t.Subject)
            .Include(a => a.RecordedByEmployee)
            .Where(a => a.TeachingAssignmentId == request.TeachingAssignmentId && a.Date == day)
            .ToListAsync();
        return list1.Select(MapToResponse).ToList();
    }

    public async Task<List<AttendanceResponse>> GetByStudentIdAsync(int studentId)
    {
        var list2 = await _context.Set<Attendance>()
            .Include(a => a.Student)
            .Include(a => a.TeachingAssignment).ThenInclude(t => t.Subject)
            .Include(a => a.RecordedByEmployee)
            .Where(a => a.StudentId == studentId)
            .OrderByDescending(a => a.Date)
            .ToListAsync();
        return list2.Select(MapToResponse).ToList();
    }


    public async Task<AttendanceSummaryResponse> GetSummaryByStudentIdAsync(int studentId)
    {
        var records = await _context.Set<Attendance>()
            .Where(a => a.StudentId == studentId)
            .Select(a => a.Status)
            .ToListAsync();

        var total = records.Count;
        var present = records.Count(s => s == AttendanceStatus.Present);
        var tardy = records.Count(s => s == AttendanceStatus.Tardy);
        var absent = records.Count(s => s == AttendanceStatus.Absent);
        var excused = records.Count(s => s == AttendanceStatus.Excused);

        return new AttendanceSummaryResponse
        {
            StudentId = studentId,
            TotalDaysRecorded = total,
            PresentDays = present,
            TardyDays = tardy,
            AbsentDays = absent,
            ExcusedDays = excused,
            AttendanceRate = total == 0 ? 0 : Math.Round((decimal)(present + tardy) / total * 100, 2)
        };
    }

    public async Task<int?> GetStudentIdByUserIdAsync(int userId)
    {
        var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
        return student?.Id;
    }

    private static AttendanceResponse MapToResponse(Attendance a)
    {
        return new AttendanceResponse
        {
            Id = a.Id,
            TeachingAssignmentId = a.TeachingAssignmentId,
            SubjectName = a.TeachingAssignment.Subject.SubjectName,
            StudentId = a.StudentId,
            StudentName = $"{a.Student.FirstName} {a.Student.LastName}",
            Date = a.Date,
            Status = a.Status.ToString(),
            Remarks = a.Remarks,
            RecordedByName = a.RecordedByEmployee != null
                ? $"{a.RecordedByEmployee.FirstName} {a.RecordedByEmployee.LastName}"
                : null
        };
    }
}
