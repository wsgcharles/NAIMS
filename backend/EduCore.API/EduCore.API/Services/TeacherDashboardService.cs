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

    public TeacherDashboardService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<List<MyClassResponse>> GetMyClassesAsync(int userId)
    {
        // Find the logged-in teacher using the UserId from the JWT
        var teacher = await _context.Employees
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.IsActive);

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

                StudentCount = _context.Grades.Count(s =>
                    s.TeachingAssignmentId == x.Id)
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
            .Where(x =>
                x.SectionId == assignment.SectionId &&
                x.Status == EduCore.API.Enums.EnrollmentStatus.Approved)
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

        return await _context.Grades
            .Where(g =>
                g.TeachingAssignmentId == assignment.Id)
            .Include(g => g.Enrollment)
            .ThenInclude(e => e.Student)
            .Select(grade => new TeacherGradeResponse
            {
                GradeId = grade.Id,

                StudentId = grade.Enrollment.Student.Id,
                StudentNumber = grade.Enrollment.Student.StudentNumber,
                StudentName = grade.Enrollment.Student.FirstName + " " + grade.Enrollment.Student.LastName,

                    PrelimGrade = grade.PrelimGrade,
                    MidtermGrade = grade.MidtermGrade,
                    FinalGrade = grade.FinalGrade,
                    FinalAverage = grade.FinalAverage,
                    Remarks = grade.IsCompleted ? "Completed" : "In Progress",

                    IsReleased = grade.IsCompleted,
                    DateEncoded = grade.CreatedAt
                })
            .OrderBy(x => x.StudentName)
            .ToListAsync();

    }

    public async Task<bool> UpdateGradeAsync(
    int userId,
    int gradeId,
    UpdateTeacherGradeRequest request)
    {
        // Find the teacher linked to the logged-in user
        var teacher = await _context.Employees
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.Position == "Teacher");

        if (teacher == null)
            return false;

        var grade = await _context.Grades
            .FirstOrDefaultAsync(x => x.Id == gradeId);

        if (grade == null)
            return false;

        // Verify this teacher owns the grade
        var teachingAssignment = await _context.TeachingAssignments
            .FirstOrDefaultAsync(x => x.Id == grade.TeachingAssignmentId);
            
        if (teachingAssignment == null || teachingAssignment.EmployeeId != teacher.Id)
            return false;

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

        grade.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ReleaseGradesAsync(
     int userId,
     int teachingAssignmentId,
     bool isReleased)
    {
        Console.WriteLine($"UserId from JWT: {userId}");

        var teacher = await _context.Employees
            .FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.Position == "Teacher");

        if (teacher == null)
        {
            Console.WriteLine("Teacher NOT FOUND");
            return false;
        }

        Console.WriteLine($"TeacherId = {teacher.Id}");

        var assignment = await _context.TeachingAssignments
            .FirstOrDefaultAsync(x =>
                x.Id == teachingAssignmentId &&
                x.EmployeeId == teacher.Id);

        if (assignment == null)
        {
            Console.WriteLine("Teaching Assignment NOT FOUND");
            return false;
        }

        Console.WriteLine($"Assignment = {assignment.Id}");

        var grades = await _context.Grades
            .Where(g =>
                g.TeachingAssignmentId == assignment.Id)
            .ToListAsync();

        Console.WriteLine($"Grades found = {grades.Count}");

        if (!grades.Any())
        {
            Console.WriteLine("NO MATCHING GRADES");
            return false;
        }

        foreach (var grade in grades)
        {
            grade.IsCompleted = isReleased;
            grade.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return true;
    }
}