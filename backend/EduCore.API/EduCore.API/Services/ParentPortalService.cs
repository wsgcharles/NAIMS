using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.DTOs.ParentPortal;
using EduCore.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class ParentPortalService : IParentPortalService
{
    private readonly EduCoreDbContext _context;

    public ParentPortalService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<int?> GetParentIdByUserIdAsync(int userId)
    {
        var parent = await _context.Parents.FirstOrDefaultAsync(p => p.UserId == userId);
        return parent?.Id;
    }

    public async Task<ParentProfileResponse?> GetProfileAsync(int parentId)
    {
        var parent = await _context.Parents
            .FirstOrDefaultAsync(p => p.Id == parentId);

        if (parent == null) return null;

        var parts = new List<string> { parent.FirstName, parent.MiddleName, parent.LastName };
        var fullName = string.Join(" ", parts.Where(x => !string.IsNullOrWhiteSpace(x)));

        return new ParentProfileResponse
        {
            ParentId = parent.Id,
            FullName = fullName,
            Email = parent.Email ?? string.Empty,
            PhoneNumber = parent.PhoneNumber,
            Address = parent.Address,
            Occupation = parent.Occupation
        };
    }

    public async Task<List<ChildSummaryResponse>> GetChildrenAsync(int parentId)
    {
        return await _context.Students
            .Where(s => s.ParentId == parentId)
            .Select(s => new ChildSummaryResponse
            {
                StudentId = s.Id,
                StudentNumber = s.StudentNumber,
                FullName = $"{s.FirstName} {(string.IsNullOrWhiteSpace(s.MiddleName) ? "" : s.MiddleName + " ")}{s.LastName} {s.Suffix}".Trim(),
                Status = s.Status.ToString(),
                CurrentGradeLevel = _context.Enrollments
                    .Where(e => e.StudentId == s.Id && e.SectionId != null && e.Section!.ProgramOffering!.AcademicYear!.Status == Enums.AcademicYearStatus.Current)
                    .Select(e => e.Section!.ProgramOffering!.GradeLevel!.Name)
                    .FirstOrDefault() ?? "Not Enrolled",
                CurrentSection = _context.StudentSectionAssignments
                    .Where(ssa => ssa.StudentId == s.Id && ssa.Section.ProgramOffering.AcademicYear.Status == Enums.AcademicYearStatus.Current)
                    .Select(ssa => ssa.Section!.SectionName)
                    .FirstOrDefault() ?? "Unassigned"
            })
            .ToListAsync();
    }

    public async Task<ChildDetailsResponse?> GetChildDetailsAsync(int parentId, int studentId)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.ParentId == parentId && s.Id == studentId);

        if (student == null) return null;

        var currentEnrollment = await _context.Enrollments
            .Include(e => e.Section)
                .ThenInclude(s => s!.ProgramOffering)
                    .ThenInclude(po => po!.GradeLevel)
            .Where(e => e.StudentId == student.Id && e.SectionId != null && e.Section!.ProgramOffering!.AcademicYear!.Status == Enums.AcademicYearStatus.Current)
            .FirstOrDefaultAsync();

        var currentSection = await _context.StudentSectionAssignments
            .Include(ssa => ssa.Section)
            .Where(ssa => ssa.StudentId == student.Id && ssa.Section.ProgramOffering.AcademicYear.Status == Enums.AcademicYearStatus.Current)
            .FirstOrDefaultAsync();

        return new ChildDetailsResponse
        {
            StudentId = student.Id,
            StudentNumber = student.StudentNumber,
            FullName = $"{student.FirstName} {(string.IsNullOrWhiteSpace(student.MiddleName) ? "" : student.MiddleName + " ")}{student.LastName} {student.Suffix}".Trim(),
            Status = student.Status.ToString(),
            BirthDate = student.BirthDate.ToString("yyyy-MM-dd"),
            Gender = student.Gender.ToString(),
            Address = $"{student.Address}, {student.Barangay}, {student.City}, {student.Province}",
            CurrentGradeLevel = currentEnrollment?.Section?.ProgramOffering?.GradeLevel?.Name ?? "Not Enrolled",
            CurrentSection = currentSection?.Section.SectionName ?? "Unassigned"
        };
    }

    public async Task<List<ChildSubjectResponse>> GetChildSubjectsAsync(int parentId, int studentId, int academicYearId)
    {
        var isChild = await _context.Students.AnyAsync(s => s.ParentId == parentId && s.Id == studentId);
        if (!isChild) return new List<ChildSubjectResponse>();

        return await _context.StudentSectionAssignments
            .Where(ssa => ssa.StudentId == studentId && ssa.Section.ProgramOffering.AcademicYearId == academicYearId)
            .SelectMany(ssa => ssa.Section.TeachingAssignments.Where(ta => ta.IsActive))
            .Select(ta => new ChildSubjectResponse
            {
                TeachingAssignmentId = ta.Id,
                SubjectCode = ta.Subject.SubjectCode,
                SubjectName = ta.Subject.SubjectName,
                TeacherName = $"{ta.Employee.FirstName} {ta.Employee.LastName}",
                Units = ta.Subject.Units
            })
            .ToListAsync();
    }

    public async Task<List<ChildGradeResponse>> GetChildGradesAsync(int parentId, int studentId, int academicYearId)
    {
        var isChild = await _context.Students.AnyAsync(s => s.ParentId == parentId && s.Id == studentId);
        if (!isChild) return new List<ChildGradeResponse>();

        return await _context.Grades
            .Where(g => g.Enrollment!.StudentId == studentId &&
                        g.Enrollment!.SectionId != null &&
                        g.Enrollment!.Section!.ProgramOffering!.AcademicYearId == academicYearId &&
                        g.Status == EduCore.API.Enums.GradeStatus.Released)
            .Select(g => new ChildGradeResponse
            {
                SubjectCode = g.TeachingAssignment.Subject.SubjectCode,
                SubjectName = g.TeachingAssignment.Subject.SubjectName,
                TeacherName = $"{g.TeachingAssignment.Employee.FirstName} {g.TeachingAssignment.Employee.LastName}",
                PrelimGrade = g.PrelimGrade,
                MidtermGrade = g.MidtermGrade,
                FinalGrade = g.FinalGrade,
                FinalAverage = g.FinalAverage,
                Remarks = g.Remarks ?? string.Empty
            })
            .ToListAsync();
    }

    public async Task<List<EnrollmentResponse>> GetChildEnrollmentsAsync(int parentId, int studentId)
    {
        var isChild = await _context.Students.AnyAsync(s => s.ParentId == parentId && s.Id == studentId);
        if (!isChild) return new List<EnrollmentResponse>();

        return await _context.Enrollments
            .Where(e => e.StudentId == studentId)
            .OrderByDescending(e => e.Section != null && e.Section.ProgramOffering != null && e.Section.ProgramOffering.AcademicYear != null ? e.Section.ProgramOffering.AcademicYear.StartDate : DateTime.MinValue)
            .Select(e => new EnrollmentResponse
            {
                Id = e.Id,
                ApplicationNumber = e.EnrollmentNumber, 
                FullName = string.Empty,
                GradeApplyingFor = (e.Section != null && e.Section.ProgramOffering != null && e.Section.ProgramOffering.GradeLevel != null) ? e.Section.ProgramOffering.GradeLevel.Name : "N/A",
                PreviousSchool = string.Empty,
                Email = string.Empty,
                Status = e.Status.ToString(),
                IsApproved = e.Status == Enums.EnrollmentStatus.Approved,
                CreatedAt = e.EnrollmentDate
            })
            .ToListAsync();

    }
}
