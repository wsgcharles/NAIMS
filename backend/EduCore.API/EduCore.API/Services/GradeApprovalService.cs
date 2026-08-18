using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Enums;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class GradeApprovalService : IGradeApprovalService
{
    private readonly EduCoreDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IAuditLogService _auditLogService;

    public GradeApprovalService(
        EduCoreDbContext context,
        INotificationService notificationService,
        IAuditLogService auditLogService)
    {
        _context = context;
        _notificationService = notificationService;
        _auditLogService = auditLogService;
    }

    private static GradeApprovalItemDto MapToItemDto(Grade g)
    {
        var student = g.Enrollment?.Student;
        var ta = g.TeachingAssignment;
        var teacher = ta?.Employee;
        var section = ta?.Section;
        var gradeLevel = section?.ProgramOffering?.GradeLevel;
        var ay = section?.ProgramOffering?.AcademicYear;

        return new GradeApprovalItemDto
        {
            GradeId = g.Id,
            TeachingAssignmentId = g.TeachingAssignmentId,
            StudentName = student != null ? $"{student.FirstName} {student.LastName}" : "Student",
            StudentNumber = student?.StudentNumber ?? "N/A",
            SubjectCode = ta?.Subject?.SubjectCode ?? "SUBJ",
            SubjectName = ta?.Subject?.SubjectName ?? "Subject",
            TeacherName = teacher != null ? $"{teacher.FirstName} {teacher.LastName}" : "Teacher",
            SectionName = section?.SectionName ?? "Section",
            GradeLevelName = gradeLevel?.Name ?? "Grade Level",
            AcademicYear = ay?.SchoolYear ?? "SY 2026–2027",
            Semester = ay?.CurrentSemester ?? "1st Semester",
            PrelimGrade = g.PrelimGrade,
            MidtermGrade = g.MidtermGrade,
            FinalGrade = g.FinalGrade,
            FinalAverage = g.FinalAverage,
            Status = g.Status.ToString(),
            SubmittedAt = g.SubmittedAt,
            ApprovedAt = g.ApprovedAt,
            ApprovedByTeacherOrAdmin = g.ApprovedByEmployee != null ? $"{g.ApprovedByEmployee.FirstName} {g.ApprovedByEmployee.LastName}" : null,
            ReviewerRemarks = g.ReviewerRemarks
        };
    }

    public async Task<List<GradeApprovalItemDto>> GetPendingApprovalsAsync()
    {
        var grades = await _context.Grades
            .Include(g => g.Enrollment).ThenInclude(e => e.Student)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Subject)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Employee)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Section).ThenInclude(s => s.ProgramOffering).ThenInclude(p => p.GradeLevel)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Section).ThenInclude(s => s.ProgramOffering).ThenInclude(p => p.AcademicYear)
            .Include(g => g.ApprovedByEmployee)
            .Where(g => g.Status == GradeStatus.Submitted)
            .OrderByDescending(g => g.SubmittedAt)
            .ToListAsync();

        return grades.Select(MapToItemDto).ToList();
    }

    public async Task<List<GradeApprovalItemDto>> GetAllGradesForApprovalAsync(int? academicYearId, string? statusFilter)
    {
        var query = _context.Grades
            .Include(g => g.Enrollment).ThenInclude(e => e.Student)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Subject)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Employee)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Section).ThenInclude(s => s.ProgramOffering).ThenInclude(p => p.GradeLevel)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Section).ThenInclude(s => s.ProgramOffering).ThenInclude(p => p.AcademicYear)
            .Include(g => g.ApprovedByEmployee)
            .AsQueryable();

        if (academicYearId.HasValue && academicYearId.Value > 0)
        {
            query = query.Where(g => g.TeachingAssignment.Section.ProgramOffering.AcademicYearId == academicYearId.Value);
        }

        if (!string.IsNullOrWhiteSpace(statusFilter) && Enum.TryParse<GradeStatus>(statusFilter, true, out var statusEnum))
        {
            query = query.Where(g => g.Status == statusEnum);
        }

        var grades = await query.OrderByDescending(g => g.UpdatedAt ?? g.CreatedAt).ToListAsync();
        return grades.Select(MapToItemDto).ToList();
    }

    public async Task<bool> ApproveGradeAsync(int reviewerUserId, int gradeId, string? remarks)
    {
        var reviewer = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == reviewerUserId);
        var grade = await _context.Grades
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Employee)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Subject)
            .FirstOrDefaultAsync(g => g.Id == gradeId);

        if (grade == null) return false;

        // Self-approval prevention: reviewer cannot be the teacher who submitted the grades
        var teacherUserId = grade.TeachingAssignment?.Employee?.UserId;
        if (teacherUserId.HasValue && teacherUserId.Value == reviewerUserId)
            throw new InvalidOperationException("You cannot approve grades that you submitted. A different reviewer must approve.");

        grade.Status = GradeStatus.Approved;
        grade.ApprovedAt = DateTime.UtcNow;
        if (reviewer != null) grade.ApprovedByEmployeeId = reviewer.Id;
        if (!string.IsNullOrWhiteSpace(remarks)) grade.ReviewerRemarks = remarks;
        grade.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Audit Log & Notification to Teacher
        try
        {
            await _auditLogService.LogAsync("Grades Approved", $"Grade record #{gradeId} approved by reviewer.", reviewerUserId.ToString(), "Grades");

            if (teacherUserId.HasValue)
            {
                await _notificationService.NotifyUserAsync(
                    teacherUserId.Value,
                    "Grades Approved",
                    $"Your submitted grades for {grade.TeachingAssignment?.Subject?.SubjectName ?? "Subject"} have been officially approved.",
                    "Success"
                );
            }
        }
        catch { }

        return true;
    }

    public async Task<bool> ApproveClassGradesAsync(int reviewerUserId, int teachingAssignmentId, string? remarks)
    {
        var reviewer = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == reviewerUserId);
        var grades = await _context.Grades
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Employee)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Subject)
            .Where(g => g.TeachingAssignmentId == teachingAssignmentId && g.Status == GradeStatus.Submitted)
            .ToListAsync();

        if (!grades.Any()) return false;

        // Self-approval prevention: reviewer cannot be the teacher who owns the teaching assignment
        var submittingTeacherUserId = grades.FirstOrDefault()?.TeachingAssignment?.Employee?.UserId;
        if (submittingTeacherUserId.HasValue && submittingTeacherUserId.Value == reviewerUserId)
            throw new InvalidOperationException("You cannot approve grades that you submitted. A different reviewer must approve.");

        var now = DateTime.UtcNow;
        foreach (var grade in grades)
        {
            grade.Status = GradeStatus.Approved;
            grade.ApprovedAt = now;
            if (reviewer != null) grade.ApprovedByEmployeeId = reviewer.Id;
            if (!string.IsNullOrWhiteSpace(remarks)) grade.ReviewerRemarks = remarks;
            grade.UpdatedAt = now;
        }

        await _context.SaveChangesAsync();

        var first = grades.First();
        try
        {
            await _auditLogService.LogAsync("Grades Approved", $"Class grades for teaching assignment #{teachingAssignmentId} approved.", reviewerUserId.ToString(), "Grades");

            var teacherUserId = first.TeachingAssignment?.Employee?.UserId;
            if (teacherUserId.HasValue)
            {
                await _notificationService.NotifyUserAsync(
                    teacherUserId.Value,
                    "Grades Approved",
                    $"Your submitted class grades for {first.TeachingAssignment?.Subject?.SubjectName ?? "Subject"} have been officially approved by the Academic Head.",
                    "Success"
                );
            }
        }
        catch { }

        return true;
    }

    public async Task<bool> RejectGradeAsync(int reviewerUserId, int gradeId, string remarks)
    {
        var reviewer = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == reviewerUserId);
        var grade = await _context.Grades
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Employee)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Subject)
            .FirstOrDefaultAsync(g => g.Id == gradeId);

        if (grade == null) return false;

        grade.Status = GradeStatus.Rejected;
        grade.ReviewerRemarks = remarks;
        grade.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        try
        {
            await _auditLogService.LogAsync("Grades Rejected", $"Grade record #{gradeId} returned for revision: {remarks}", reviewerUserId.ToString(), "Grades");

            var teacherUserId = grade.TeachingAssignment?.Employee?.UserId;
            if (teacherUserId.HasValue)
            {
                await _notificationService.NotifyUserAsync(
                    teacherUserId.Value,
                    "Grades Returned for Revision",
                    $"Your submitted grades for {grade.TeachingAssignment?.Subject?.SubjectName ?? "Subject"} were returned for revision. Remarks: {remarks}",
                    "Warning"
                );
            }
        }
        catch { }

        return true;
    }

    public async Task<bool> RejectClassGradesAsync(int reviewerUserId, int teachingAssignmentId, string remarks)
    {
        var grades = await _context.Grades
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Employee)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Subject)
            .Where(g => g.TeachingAssignmentId == teachingAssignmentId && g.Status == GradeStatus.Submitted)
            .ToListAsync();

        if (!grades.Any()) return false;

        var now = DateTime.UtcNow;
        foreach (var grade in grades)
        {
            grade.Status = GradeStatus.Rejected;
            grade.ReviewerRemarks = remarks;
            grade.UpdatedAt = now;
        }

        await _context.SaveChangesAsync();

        var first = grades.First();
        try
        {
            await _auditLogService.LogAsync("Grades Rejected", $"Class grades for assignment #{teachingAssignmentId} returned for revision: {remarks}", reviewerUserId.ToString(), "Grades");

            var teacherUserId = first.TeachingAssignment?.Employee?.UserId;
            if (teacherUserId.HasValue)
            {
                await _notificationService.NotifyUserAsync(
                    teacherUserId.Value,
                    "Grades Returned for Revision",
                    $"Your submitted class grades for {first.TeachingAssignment?.Subject?.SubjectName ?? "Subject"} were returned for revision. Remarks: {remarks}",
                    "Warning"
                );
            }
        }
        catch { }

        return true;
    }

    public async Task<bool> ReleaseClassGradesAsync(int reviewerUserId, int teachingAssignmentId)
    {
        var grades = await _context.Grades
            .Include(g => g.Enrollment).ThenInclude(e => e.Student)
            .Include(g => g.TeachingAssignment).ThenInclude(t => t.Subject)
            .Where(g => g.TeachingAssignmentId == teachingAssignmentId && g.Status == GradeStatus.Approved)
            .ToListAsync();

        if (!grades.Any()) return false;

        var now = DateTime.UtcNow;
        foreach (var grade in grades)
        {
            grade.Status = GradeStatus.Released;
            grade.IsCompleted = true;
            grade.UpdatedAt = now;
        }

        await _context.SaveChangesAsync();

        var first = grades.First();
        var subjectName = first.TeachingAssignment?.Subject?.SubjectName ?? "Subject";

        try
        {
            await _auditLogService.LogAsync("Grades Released", $"Grades officially released for teaching assignment #{teachingAssignmentId} ({subjectName}).", reviewerUserId.ToString(), "Grades");

            // Notify Students and Parents
            foreach (var grade in grades)
            {
                var student = grade.Enrollment?.Student;
                if (student != null)
                {
                    if (student.UserId.HasValue)
                    {
                        await _notificationService.NotifyUserAsync(
                            student.UserId.Value,
                            "Grades Released",
                            $"Your official grades for {subjectName} have been released and are now available in your portal.",
                            "Success"
                        );
                    }

                    if (student.ParentId.HasValue)
                    {
                        var parent = await _context.Parents.FirstOrDefaultAsync(p => p.Id == student.ParentId.Value);
                        if (parent != null && parent.UserId.HasValue)
                        {
                            await _notificationService.NotifyUserAsync(
                                parent.UserId.Value,
                                "Child's Grades Released",
                                $"Official grades for {student.FirstName} {student.LastName} ({subjectName}) are now available in your Guardian Portal.",
                                "Success"
                            );
                        }
                    }
                }
            }
        }
        catch { }

        return true;
    }
}
