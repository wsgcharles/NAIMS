using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Enums;
using EduCore.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Teacher,Administrator,SuperAdministrator")]
public class TeacherAttendanceController : ControllerBase
{
    private readonly EduCoreDbContext _context;

    public TeacherAttendanceController(EduCoreDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst("UserId")?.Value;
        if (!int.TryParse(claim, out var userId))
            throw new UnauthorizedAccessException("User identity could not be resolved.");
        return userId;
    }

    private async Task<Employee?> GetCurrentEmployeeAsync()
    {
        var userId = GetUserId();
        return await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
    }

    [HttpGet("classes")]
    public async Task<IActionResult> GetAssignedClasses()
    {
        var employee = await GetCurrentEmployeeAsync();
        var assignments = new List<TeachingAssignment>();

        if (employee != null)
        {
            assignments = await _context.TeachingAssignments
                .Include(t => t.Section)
                .Include(t => t.Subject)
                .Where(t => t.EmployeeId == employee.Id && t.IsActive)
                .ToListAsync();
        }

        // Fallback: If no direct assignments exist for the logged-in user, fetch active sections in PostgreSQL
        if (assignments.Count == 0)
        {
            return Ok(new List<TeacherClassResponse>());
        }

        var result = new List<TeacherClassResponse>();
        foreach (var a in assignments)
        {
            var studentCount = await _context.StudentSectionAssignments
                .CountAsync(sa => sa.SectionId == a.SectionId && sa.IsActive);

            result.Add(new TeacherClassResponse
            {
                ClassId = a.Id,
                TeachingAssignmentId = a.Id,
                ClassName = $"{a.Section.SectionName} - {a.Subject.SubjectName}",
                SectionName = a.Section.SectionName,
                SubjectName = a.Subject.SubjectName,
                GradeLevel = "Grade 11",
                StudentCount = studentCount
            });
        }

        return Ok(result);
    }

    [HttpGet("dashboard")]
    [HttpGet("today-summary")]
    public async Task<IActionResult> GetDashboardSummary([FromQuery] int? classId, [FromQuery] DateTime? date)
    {
        var today = (date ?? DateTime.UtcNow).Date;
        var employee = await GetCurrentEmployeeAsync();

        var query = _context.Set<Attendance>().Where(a => a.Date.Date == today);

        if (classId.HasValue && classId.Value > 0)
        {
            var isTa = await _context.TeachingAssignments.AnyAsync(t => t.Id == classId.Value);
            if (isTa)
            {
                query = query.Where(a => a.TeachingAssignmentId == classId.Value);
            }
            else
            {
                var taIds = await _context.TeachingAssignments
                    .Where(t => t.SectionId == classId.Value)
                    .Select(t => t.Id)
                    .ToListAsync();
                if (taIds.Any())
                {
                    query = query.Where(a => taIds.Contains(a.TeachingAssignmentId));
                }
            }
        }
        else if (employee != null)
        {
            var taIds = await _context.TeachingAssignments
                .Where(t => t.EmployeeId == employee.Id)
                .Select(t => t.Id)
                .ToListAsync();
            if (taIds.Any())
            {
                query = query.Where(a => taIds.Contains(a.TeachingAssignmentId));
            }
        }

        var records = await query.ToListAsync();

        var present = records.Count(r => r.Status == AttendanceStatus.Present);
        var tardy = records.Count(r => r.Status == AttendanceStatus.Tardy);
        var absent = records.Count(r => r.Status == AttendanceStatus.Absent);

        int totalStudents = 0;
        if (classId.HasValue && classId.Value > 0)
        {
            var sectionId = classId.Value;
            var ta = await _context.TeachingAssignments.FirstOrDefaultAsync(t => t.Id == classId.Value);
            if (ta != null) sectionId = ta.SectionId;

            totalStudents = await _context.StudentSectionAssignments
                .CountAsync(sa => sa.SectionId == sectionId && sa.IsActive);
        }
        else
        {
            totalStudents = await _context.Students.CountAsync();
        }

        return Ok(new TeacherAttendanceDashboardSummary
        {
            PresentCount = present,
            TardyCount = tardy,
            AbsentCount = absent,
            TotalStudents = totalStudents,
            Date = today
        });
    }

    [HttpGet("students/{classId}")]
    [HttpGet("roster/{classId}")]
    public async Task<IActionResult> GetStudentRoster(int classId, [FromQuery] DateTime? date)
    {
        var targetDate = (date ?? DateTime.UtcNow).Date;
        int sectionId = classId;
        int teachingAssignmentId = classId;

        var ta = await _context.TeachingAssignments.FirstOrDefaultAsync(t => t.Id == classId);
        if (ta != null)
        {
            sectionId = ta.SectionId;
            teachingAssignmentId = ta.Id;
        }

        var students = await _context.StudentSectionAssignments
            .Include(sa => sa.Student)
            .Where(sa => sa.SectionId == sectionId && sa.IsActive)
            .OrderBy(sa => sa.Student.LastName)
            .ThenBy(sa => sa.Student.FirstName)
            .Select(sa => sa.Student)
            .ToListAsync();

        if (students.Count == 0)
        {
            return Ok(new List<TeacherStudentRosterEntry>());
        }

        var existingRecords = await _context.Set<Attendance>()
            .Where(a => a.Date.Date == targetDate && (a.TeachingAssignmentId == teachingAssignmentId || a.TeachingAssignment.SectionId == sectionId))
            .ToDictionaryAsync(a => a.StudentId);

        var result = students.Select(s => new TeacherStudentRosterEntry
        {
            StudentId = s.Id,
            Lrn = string.IsNullOrWhiteSpace(s.LRN) ? $"STU-{s.Id:D4}" : s.LRN,
            StudentName = $"{s.FirstName} {s.LastName}",
            Status = existingRecords.TryGetValue(s.Id, out var rec) ? rec.Status.ToString() : "Present",
            Remarks = existingRecords.TryGetValue(s.Id, out var rec2) ? rec2.Remarks : null
        }).ToList();

        return Ok(result);
    }

    [HttpPost("save")]
    public async Task<IActionResult> SaveAttendance([FromBody] SaveTeacherAttendanceRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var targetDate = (request.Date ?? DateTime.UtcNow).Date;
        var employee = await GetCurrentEmployeeAsync();
        var employeeId = employee?.Id;

        int teachingAssignmentId = request.ClassId;
        var ta = await _context.TeachingAssignments.FirstOrDefaultAsync(t => t.Id == request.ClassId);
        if (ta == null)
        {
            var firstTa = await _context.TeachingAssignments.FirstOrDefaultAsync(t => t.SectionId == request.ClassId);
            if (firstTa != null)
            {
                teachingAssignmentId = firstTa.Id;
            }
            else
            {
                var firstSubject = await _context.Subjects.FirstOrDefaultAsync();
                if (firstSubject != null && employeeId.HasValue)
                {
                    var newTa = new TeachingAssignment
                    {
                        EmployeeId = employeeId.Value,
                        SectionId = request.ClassId,
                        SubjectId = firstSubject.Id,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.TeachingAssignments.Add(newTa);
                    await _context.SaveChangesAsync();
                    teachingAssignmentId = newTa.Id;
                }
            }
        }

        var existingRecords = await _context.Set<Attendance>()
            .Where(a => a.TeachingAssignmentId == teachingAssignmentId && a.Date.Date == targetDate)
            .ToDictionaryAsync(a => a.StudentId);

        foreach (var entry in request.Entries)
        {
            if (!Enum.TryParse<AttendanceStatus>(entry.Status, true, out var status))
                status = AttendanceStatus.Present;

            if (existingRecords.TryGetValue(entry.StudentId, out var record))
            {
                record.Status = status;
                record.Remarks = entry.Remarks;
                if (employeeId.HasValue) record.RecordedByEmployeeId = employeeId.Value;
                record.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.Set<Attendance>().Add(new Attendance
                {
                    TeachingAssignmentId = teachingAssignmentId,
                    StudentId = entry.StudentId,
                    Date = targetDate,
                    Status = status,
                    Remarks = entry.Remarks,
                    RecordedByEmployeeId = employeeId,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();

        var updatedRecords = await _context.Set<Attendance>()
            .Where(a => a.TeachingAssignmentId == teachingAssignmentId && a.Date.Date == targetDate)
            .ToListAsync();

        var present = updatedRecords.Count(r => r.Status == AttendanceStatus.Present);
        var tardy = updatedRecords.Count(r => r.Status == AttendanceStatus.Tardy);
        var absent = updatedRecords.Count(r => r.Status == AttendanceStatus.Absent);

        return Ok(new
        {
            message = "Attendance records saved successfully to PostgreSQL database.",
            summary = new TeacherAttendanceDashboardSummary
            {
                PresentCount = present,
                TardyCount = tardy,
                AbsentCount = absent,
                TotalStudents = request.Entries.Count,
                Date = targetDate
            }
        });
    }
}
