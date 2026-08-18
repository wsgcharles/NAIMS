using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Enums;
using Microsoft.EntityFrameworkCore;
using EduCore.API.Models;

namespace EduCore.API.Services;

public class TeacherDashboardService : ITeacherDashboardService
{
    private readonly EduCoreDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IAuditLogService _auditLogService;

    public TeacherDashboardService(
        EduCoreDbContext context,
        INotificationService notificationService,
        IAuditLogService auditLogService)
    {
        _context = context;
        _notificationService = notificationService;
        _auditLogService = auditLogService;
    }

    public async Task<List<MyClassResponse>> GetMyClassesAsync(int userId)
    {
        var teacher = await _context.Employees
            .FirstOrDefaultAsync(x => x.UserId == userId && x.IsActive);

        if (teacher == null)
            return new List<MyClassResponse>();

        var classes = await _context.TeachingAssignments
            .Where(x => x.EmployeeId == teacher.Id && x.IsActive)
            .Select(x => new MyClassResponse
            {
                TeachingAssignmentId = x.Id,
                SubjectId = x.SubjectId,
                SubjectName = x.Subject.SubjectName,
                SectionId = x.SectionId,
                SectionName = x.Section.ProgramOffering.GradeLevel.Name + " - " + x.Section.SectionName,
                AcademicYearId = x.Section.ProgramOffering.AcademicYearId,
                AcademicYear = x.Section.ProgramOffering.AcademicYear.SchoolYear,
                StudentCount = _context.Grades.Count(s => s.TeachingAssignmentId == x.Id)
            })
            .ToListAsync();

        return classes;
    }

    public async Task<List<StudentClassResponse>> GetStudentsAsync(int teachingAssignmentId)
    {
        var assignment = await _context.TeachingAssignments
            .FirstOrDefaultAsync(x => x.Id == teachingAssignmentId);

        if (assignment == null)
            return new List<StudentClassResponse>();

        return await _context.Set<Enrollment>()
            .Where(x => x.SectionId == assignment.SectionId && x.Status == EnrollmentStatus.Approved)
            .Join(_context.Students,
                ssa => ssa.StudentId,
                student => student.Id,
                (ssa, student) => new StudentClassResponse
                {
                    StudentId = student.Id,
                    StudentNumber = student.StudentNumber,
                    StudentName = student.FirstName + " " + student.LastName
                })
            .OrderBy(x => x.StudentName)
            .ToListAsync();
    }

    public async Task<List<TeacherGradeResponse>> GetGradesAsync(int teachingAssignmentId)
    {
        var assignment = await _context.TeachingAssignments
            .FirstOrDefaultAsync(x => x.Id == teachingAssignmentId);

        if (assignment == null)
            return new List<TeacherGradeResponse>();

        var rawGrades = await _context.Grades
            .Where(g => g.TeachingAssignmentId == assignment.Id)
            .Include(g => g.Enrollment).ThenInclude(e => e.Student)
            .ToListAsync();

        var grades = rawGrades
            .Select(grade => new TeacherGradeResponse
            {
                GradeId = grade.Id,
                StudentId = grade.Enrollment?.Student?.Id ?? 0,
                StudentNumber = grade.Enrollment?.Student?.StudentNumber ?? string.Empty,
                StudentName = grade.Enrollment?.Student != null
                    ? grade.Enrollment.Student.FirstName + " " + grade.Enrollment.Student.LastName
                    : "Unknown Student",
                PrelimGrade = grade.PrelimGrade,
                MidtermGrade = grade.MidtermGrade,
                FinalGrade = grade.FinalGrade,
                FinalAverage = grade.FinalAverage,
                Remarks = grade.Remarks ?? "",
                Status = grade.Status.ToString(),
                SubmittedAt = grade.SubmittedAt,
                ApprovedAt = grade.ApprovedAt,
                ReviewerRemarks = grade.ReviewerRemarks,
                CanEdit = grade.Status == GradeStatus.Draft || grade.Status == GradeStatus.Rejected,
                IsReleased = grade.Status == GradeStatus.Released,
                DateEncoded = grade.CreatedAt
            })
            .OrderBy(x => x.StudentName)
            .ToList();

        return grades;
    }

    public async Task<bool> UpdateGradeAsync(int userId, int gradeId, UpdateTeacherGradeRequest request)
    {
        var teacher = await _context.Employees
            .FirstOrDefaultAsync(x => x.UserId == userId && (x.Position.Contains("Teacher") || x.Position.Contains("Principal")));

        if (teacher == null) return false;

        var grade = await _context.Grades.FirstOrDefaultAsync(x => x.Id == gradeId);
        if (grade == null) return false;

        var teachingAssignment = await _context.TeachingAssignments
            .FirstOrDefaultAsync(x => x.Id == grade.TeachingAssignmentId);

        if (teachingAssignment == null || teachingAssignment.EmployeeId != teacher.Id)
            return false;

        // Block editing if grades are already submitted, approved, or released!
        if (grade.Status == GradeStatus.Submitted || grade.Status == GradeStatus.Approved || grade.Status == GradeStatus.Released)
        {
            throw new InvalidOperationException($"Grades cannot be edited while in '{grade.Status}' status. Only Draft or Rejected grades can be edited.");
        }

        grade.PrelimGrade = request.PrelimGrade;
        grade.MidtermGrade = request.MidtermGrade;
        grade.FinalGrade = request.FinalGrade;

        if (request.PrelimGrade.HasValue && request.MidtermGrade.HasValue && request.FinalGrade.HasValue)
        {
            grade.FinalAverage = Math.Round((request.PrelimGrade.Value + request.MidtermGrade.Value + request.FinalGrade.Value) / 3, 2);
        }
        else
        {
            grade.FinalAverage = null;
        }

        if (grade.Status == GradeStatus.Rejected)
        {
            // Reset to Draft upon edit so teacher can review before resubmitting
            grade.Status = GradeStatus.Draft;
        }

        grade.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> SubmitGradesForApprovalAsync(int userId, int teachingAssignmentId)
    {
        var teacher = await _context.Employees
            .FirstOrDefaultAsync(x => x.UserId == userId && (x.Position.Contains("Teacher") || x.Position.Contains("Principal")));

        if (teacher == null) return false;

        var assignment = await _context.TeachingAssignments
            .Include(t => t.Subject)
            .Include(t => t.Section)
            .FirstOrDefaultAsync(x => x.Id == teachingAssignmentId && x.EmployeeId == teacher.Id);

        if (assignment == null) return false;

        var grades = await _context.Grades
            .Where(g => g.TeachingAssignmentId == assignment.Id && (g.Status == GradeStatus.Draft || g.Status == GradeStatus.Rejected))
            .ToListAsync();

        if (!grades.Any()) return false;

        var now = DateTime.UtcNow;
        foreach (var grade in grades)
        {
            grade.Status = GradeStatus.Submitted;
            grade.SubmittedAt = now;
            grade.UpdatedAt = now;
        }

        await _context.SaveChangesAsync();

        // Audit Log
        try
        {
            await _auditLogService.LogAsync(
                "Grades Submitted",
                $"Grades submitted for approval by {teacher.FirstName} {teacher.LastName} for {assignment.Subject.SubjectName} ({assignment.Section.SectionName}).",
                userId.ToString(),
                "Grades"
            );

            // Notify Vice Principal / Academic Head / Registrar
            await _notificationService.CreateAsync(new CreateNotificationRequest
            {
                TargetRole = "Administrator",
                Title = "Grades Pending Review",
                Message = $"Teacher {teacher.FirstName} {teacher.LastName} submitted grades for {assignment.Subject.SubjectName} ({assignment.Section.SectionName}).",
                Type = "Info"
            });
        }
        catch { }

        return true;
    }

    public async Task<bool> ReleaseGradesAsync(int userId, int teachingAssignmentId, bool isReleased)
    {
        var teacher = await _context.Employees
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (teacher == null) return false;

        var assignment = await _context.TeachingAssignments
            .FirstOrDefaultAsync(x => x.Id == teachingAssignmentId);

        if (assignment == null) return false;

        var grades = await _context.Grades
            .Include(g => g.Enrollment).ThenInclude(e => e.Student)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Subject)
            .Where(g => g.TeachingAssignmentId == assignment.Id)
            .ToListAsync();

        if (!grades.Any()) return false;

        foreach (var grade in grades)
        {
            grade.Status = isReleased ? GradeStatus.Released : GradeStatus.Approved;
            grade.IsCompleted = isReleased;
            grade.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        if (isReleased)
        {
            foreach (var grade in grades)
            {
                if (grade.Enrollment?.Student != null && grade.Enrollment.Student.UserId.HasValue)
                {
                    await _notificationService.NotifyUserAsync(
                        grade.Enrollment.Student.UserId.Value,
                        "Grades Released",
                        $"Your official grade for {grade.TeachingAssignment.Subject.SubjectName} has been released.",
                        "Success");
                }
            }
        }

        return true;
    }
}