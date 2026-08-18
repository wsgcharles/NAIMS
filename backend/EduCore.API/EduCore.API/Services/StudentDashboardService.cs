using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using EduCore.API.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

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

                Teacher = x.Employee != null ? $"{x.Employee.FirstName} {x.Employee.LastName}".Trim() : "No Teacher Assigned",

                Section = x.Section != null && x.Section.ProgramOffering != null && x.Section.ProgramOffering.GradeLevel != null
                    ? (x.Section.ProgramOffering.GradeLevel.Name + " - " + x.Section.SectionName)
                    : (x.Section != null ? x.Section.SectionName : "Unassigned")
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
                x.Status == EduCore.API.Enums.GradeStatus.Released)
            .Select(x => new StudentGradeResponse
            {
                Subject = x.TeachingAssignment != null && x.TeachingAssignment.Subject != null ? x.TeachingAssignment.Subject.SubjectName : "Subject",

                Teacher = x.TeachingAssignment != null && x.TeachingAssignment.Employee != null
                    ? $"{x.TeachingAssignment.Employee.FirstName} {x.TeachingAssignment.Employee.LastName}".Trim()
                    : "No Teacher Assigned",

                PrelimGrade = x.PrelimGrade,
                MidtermGrade = x.MidtermGrade,
                FinalGrade = x.FinalGrade,
                Remarks = x.Remarks ?? ""
            })
            .OrderBy(x => x.Subject)
            .ToListAsync();
    }

    public async Task<byte[]?> GenerateGradeSlipPdfAsync(int userId)
    {
        var profile = await GetProfileAsync(userId);
        if (profile == null)
            return null;

        var grades = await GetGradesAsync(userId);

        var document = QuestPDF.Fluent.Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text("Noah's Academy").FontSize(18).Bold();
                    col.Item().Text("Official Grade Slip").FontSize(12).SemiBold();
                    col.Item().PaddingTop(5).LineHorizontal(1);
                });

                page.Content().PaddingVertical(15).Column(col =>
                {
                    col.Item().Text($"Student Name: {profile.FirstName} {profile.LastName}");
                    col.Item().Text($"Student Number: {profile.StudentNumber}");
                    col.Item().Text($"Grade Level: {profile.GradeLevel}");
                    col.Item().Text($"Section: {profile.Section}");
                    col.Item().Text($"Academic Year: {profile.AcademicYear}");

                    col.Item().PaddingTop(15).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(1.5f);
                            columns.RelativeColumn(1.5f);
                            columns.RelativeColumn(1.5f);
                            columns.RelativeColumn(2);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("Subject").Bold();
                            header.Cell().Text("Teacher").Bold();
                            header.Cell().Text("Prelim").Bold();
                            header.Cell().Text("Midterm").Bold();
                            header.Cell().Text("Final").Bold();
                            header.Cell().Text("Remarks").Bold();
                            header.Cell().ColumnSpan(6).PaddingBottom(5).LineHorizontal(1);
                        });

                        foreach (var g in grades)
                        {
                            table.Cell().Text(g.Subject);
                            table.Cell().Text(g.Teacher);
                            table.Cell().Text(g.PrelimGrade?.ToString("0.00") ?? "-");
                            table.Cell().Text(g.MidtermGrade?.ToString("0.00") ?? "-");
                            table.Cell().Text(g.FinalGrade?.ToString("0.00") ?? "-");
                            table.Cell().Text(g.Remarks);
                        }
                    });
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span($"Generated {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC — this is a system-generated document.").FontSize(8);
                });
            });
        });

        return document.GeneratePdf();
    }
}