using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using EduCore.API.Enums;

namespace EduCore.API.Services;

public class StudentDashboardService : IStudentDashboardService
{
    private readonly EduCoreDbContext _context;

    public StudentDashboardService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<StudentProfileResponse?> GetProfileAsync(int userId)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (student == null)
            return null;

        var assignment = await _context.StudentSectionAssignments
            .Include(x => x.Section)
                .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(p => p.AcademicYear)
            .Include(x => x.Section)
                .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(p => p.GradeLevel)
            .FirstOrDefaultAsync(x =>
                x.StudentId == student.Id &&
                x.IsActive);

        return new StudentProfileResponse
        {
            StudentId = student.Id,
            StudentNumber = student.StudentNumber,
            FirstName = student.FirstName,
            LastName = student.LastName,
            Email = student.Email,
            GradeLevel = assignment?.Section?.ProgramOffering?.GradeLevel?.Name ?? "",
            Section = assignment?.Section?.SectionName ?? "",
            AcademicYear = assignment?.Section?.ProgramOffering?.AcademicYear?.SchoolYear ?? ""
        };
    }

    public async Task<List<StudentSubjectResponse>> GetSubjectsAsync(int userId)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (student == null)
            return new List<StudentSubjectResponse>();

        var assignment = await _context.StudentSectionAssignments
            .Include(x => x.Section)
                .ThenInclude(s => s.ProgramOffering)
            .FirstOrDefaultAsync(x =>
                x.StudentId == student.Id &&
                x.IsActive);

        if (assignment == null)
            return new List<StudentSubjectResponse>();

        return await _context.TeachingAssignments
            .Include(x => x.Subject)
            .Include(x => x.Employee)
            .Include(x => x.Section)
                .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(p => p.GradeLevel)
            .Where(x =>
                x.SectionId == assignment.SectionId &&
                x.IsActive)
            .Select(x => new StudentSubjectResponse
            {
                SubjectId = x.SubjectId,
                SubjectName = x.Subject.SubjectName,

                Teacher = x.Employee.FirstName + " " + x.Employee.LastName,

                Section = x.Section.ProgramOffering.GradeLevel.Name + " - " + x.Section.SectionName
            })
            .ToListAsync();
    }

    public async Task<List<StudentGradeResponse>> GetGradesAsync(int userId)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (student == null)
            return new List<StudentGradeResponse>();

        return await _context.Grades
            .Include(g => g.Enrollment)
            .Include(g => g.TeachingAssignment)
                .ThenInclude(ta => ta.Subject)
            .Include(g => g.TeachingAssignment)
                .ThenInclude(ta => ta.Employee)
            .Where(x =>
                x.Enrollment.StudentId == student.Id &&
                x.IsCompleted) // Replaced IsReleased with IsCompleted, since IsReleased is no longer in Grade model
            .Select(x => new StudentGradeResponse
            {
                Subject = x.TeachingAssignment.Subject.SubjectName,

                Teacher = x.TeachingAssignment.Employee.FirstName + " " + x.TeachingAssignment.Employee.LastName,

                PrelimGrade = x.PrelimGrade,
                MidtermGrade = x.MidtermGrade,
                FinalGrade = x.FinalGrade,
                Remarks = x.Remarks ?? ""
            })
            .OrderBy(x => x.Subject)
            .ToListAsync();
    }
}