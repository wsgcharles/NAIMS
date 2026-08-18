using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class GradeService : IGradeService
{
    private readonly EduCoreDbContext _context;

    public GradeService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<GradeResponse>> GetAllAsync()
    {
        return await _context.Grades
            .Include(g => g.Enrollment)
                .ThenInclude(e => e.Student)
            .Include(g => g.Subject)
            .Include(g => g.TeachingAssignment)
                .ThenInclude(t => t.Employee)
            .Select(g => new GradeResponse
            {
                Id = g.Id,
                EnrollmentId = g.EnrollmentId,
                StudentName = g.Enrollment != null && g.Enrollment.Student != null
                    ? $"{g.Enrollment.Student.FirstName} {g.Enrollment.Student.LastName}"
                    : "Unknown Student",
                SubjectId = g.SubjectId,
                SubjectName = g.Subject != null ? g.Subject.SubjectName : "Subject",
                TeachingAssignmentId = g.TeachingAssignmentId,
                TeacherName = g.TeachingAssignment != null && g.TeachingAssignment.Employee != null
                    ? $"{g.TeachingAssignment.Employee.FirstName} {g.TeachingAssignment.Employee.LastName}"
                    : "No Teacher Assigned",

                PrelimGrade = g.PrelimGrade,
                MidtermGrade = g.MidtermGrade,
                FinalGrade = g.FinalGrade,
                FinalAverage = g.FinalAverage,
                IsCompleted = g.IsCompleted,
                CreatedAt = g.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<GradeResponse?> GetByIdAsync(int id)
    {
        return (await GetAllAsync()).FirstOrDefault(x => x.Id == id);
    }

    public async Task<GradeResponse> CreateAsync(CreateGradeRequest request)
    {
        var enrollment = await _context.Set<Enrollment>()
            .Include(e => e.Student)
            .FirstOrDefaultAsync(x => x.Id == request.EnrollmentId);
        
        if (enrollment == null)
            throw new Exception("Enrollment not found.");

        var subject = await _context.Subjects
            .FirstOrDefaultAsync(x => x.Id == request.SubjectId && x.IsActive);
        
        if (subject == null)
            throw new Exception("Subject not found.");

        var teachingAssignment = await _context.TeachingAssignments
            .Include(t => t.Employee)
            .FirstOrDefaultAsync(x => x.Id == request.TeachingAssignmentId && x.IsActive);
            
        if (teachingAssignment == null)
            throw new Exception("Teaching assignment not found.");

        var exists = await _context.Grades.AnyAsync(x =>
            x.EnrollmentId == request.EnrollmentId &&
            x.SubjectId == request.SubjectId);

        if (exists)
            throw new Exception("Grade already exists.");

        var grade = new Grade
        {
            EnrollmentId = request.EnrollmentId,
            SubjectId = request.SubjectId,
            TeachingAssignmentId = request.TeachingAssignmentId,
            PrelimGrade = request.PrelimGrade,
            MidtermGrade = request.MidtermGrade,
            FinalGrade = request.FinalGrade,
            FinalAverage = request.FinalAverage,
            IsCompleted = request.IsCompleted,
            CreatedAt = DateTime.UtcNow
        };

        _context.Grades.Add(grade);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(grade.Id))!;
    }

    public async Task<GradeResponse?> UpdateAsync(int id, UpdateGradeRequest request)
    {
        var grade = await _context.Grades.FirstOrDefaultAsync(x => x.Id == id);

        if (grade == null)
            return null;

        grade.PrelimGrade = request.PrelimGrade;
        grade.MidtermGrade = request.MidtermGrade;
        grade.FinalGrade = request.FinalGrade;
        grade.FinalAverage = request.FinalAverage;
        grade.IsCompleted = request.IsCompleted;
        grade.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var grade = await _context.Grades.FirstOrDefaultAsync(x => x.Id == id);

        if (grade == null)
            return false;

        _context.Grades.Remove(grade);
        await _context.SaveChangesAsync();

        return true;
    }
}