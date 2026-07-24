using EduCore.API.Data;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Enums;

namespace EduCore.API.Services;

public class StudentSectionAssignmentService : IStudentSectionAssignmentService
{
    private readonly EduCoreDbContext _context;

    public StudentSectionAssignmentService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<StudentSectionAssignmentResponse>> GetAllAsync()
    {
        return await _context.StudentSectionAssignments
            .Include(x => x.Student)
            .Include(x => x.Section)
                .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(p => p.AcademicYear)
            .Include(x => x.Section)
                .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(p => p.GradeLevel)
            .OrderBy(x => x.Student.LastName)
            .ThenBy(x => x.Student.FirstName)
            .Select(x => new StudentSectionAssignmentResponse
            {
                Id = x.Id,

                StudentId = x.StudentId,
                StudentName = x.Student.FirstName + " " + x.Student.LastName,

                SectionId = x.SectionId,
                SectionName = x.Section.ProgramOffering.GradeLevel.Name + " - " + x.Section.SectionName,

                AcademicYearId = x.Section.ProgramOffering.AcademicYearId,
                AcademicYear = x.Section.ProgramOffering.AcademicYear.SchoolYear,

                AssignedAt = x.AssignedAt,
                IsActive = x.IsActive
            })
            .ToListAsync();
    }

    public async Task<StudentSectionAssignmentResponse?> GetByIdAsync(int id)
    {
        return await _context.StudentSectionAssignments
            .Include(x => x.Student)
            .Include(x => x.Section)
                .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(p => p.AcademicYear)
            .Include(x => x.Section)
                .ThenInclude(s => s.ProgramOffering)
                    .ThenInclude(p => p.GradeLevel)
            .Where(x => x.Id == id)
            .Select(x => new StudentSectionAssignmentResponse
            {
                Id = x.Id,

                StudentId = x.StudentId,
                StudentName = x.Student.FirstName + " " + x.Student.LastName,

                SectionId = x.SectionId,
                SectionName = x.Section.ProgramOffering.GradeLevel.Name + " - " + x.Section.SectionName,

                AcademicYearId = x.Section.ProgramOffering.AcademicYearId,
                AcademicYear = x.Section.ProgramOffering.AcademicYear.SchoolYear,

                AssignedAt = x.AssignedAt,
                IsActive = x.IsActive
            })
            .FirstOrDefaultAsync();
    }

    public async Task<StudentSectionAssignmentResponse> CreateAsync(CreateStudentSectionAssignmentRequest request)
    {
        var student = await _context.Students
            .FirstOrDefaultAsync(x => x.Id == request.StudentId && x.Status == StudentStatus.Active);

        if (student == null)
            throw new Exception("Student not found.");

        var section = await _context.Sections
            .Include(s => s.ProgramOffering)
            .FirstOrDefaultAsync(x => x.Id == request.SectionId && x.IsActive);

        if (section == null)
            throw new Exception("Section not found.");

        // Prevent duplicate assignment for the same academic year
        var exists = await _context.StudentSectionAssignments.AnyAsync(x =>
            x.StudentId == request.StudentId &&
            x.Section.ProgramOffering.AcademicYearId == section.ProgramOffering.AcademicYearId &&
            x.IsActive);

        if (exists)
            throw new Exception("Student is already assigned to a section for this academic year.");

        var assignment = new StudentSectionAssignment
        {
            StudentId = request.StudentId,
            SectionId = request.SectionId,
            AssignedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.StudentSectionAssignments.Add(assignment);

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(assignment.Id))!;
    }

    public async Task<StudentSectionAssignmentResponse?> UpdateAsync(
    int id,
    UpdateStudentSectionAssignmentRequest request)
    {
        var assignment = await _context.StudentSectionAssignments
            .FirstOrDefaultAsync(x => x.Id == id);

        if (assignment == null)
            return null;

        var student = await _context.Students
            .FirstOrDefaultAsync(x => x.Id == request.StudentId && x.Status == StudentStatus.Active);

        if (student == null)
            throw new Exception("Student not found.");

        var section = await _context.Sections
            .Include(s => s.ProgramOffering)
            .FirstOrDefaultAsync(x => x.Id == request.SectionId && x.IsActive);

        if (section == null)
            throw new Exception("Section not found.");

        // Prevent duplicate assignment
        var exists = await _context.StudentSectionAssignments.AnyAsync(x =>
            x.Id != id &&
            x.StudentId == request.StudentId &&
            x.Section.ProgramOffering.AcademicYearId == section.ProgramOffering.AcademicYearId &&
            x.IsActive);

        if (exists)
            throw new Exception("Student is already assigned to another section for this academic year.");

        assignment.StudentId = request.StudentId;
        assignment.SectionId = request.SectionId;
        assignment.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var assignment = await _context.StudentSectionAssignments
            .FirstOrDefaultAsync(x => x.Id == id);

        if (assignment == null)
            return false;

        _context.StudentSectionAssignments.Remove(assignment);

        await _context.SaveChangesAsync();

        return true;
    }
}