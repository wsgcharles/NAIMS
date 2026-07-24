using EduCore.API.Data;
using EduCore.API.DTOs;
using EduCore.API.Interfaces;
using EduCore.API.Enums;
using Microsoft.EntityFrameworkCore;

namespace EduCore.API.Services;

public class DashboardService : IDashboardService
{
    private readonly EduCoreDbContext _context;

    public DashboardService(EduCoreDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardStatsResponse> GetAdminStatsAsync()
    {
        // Students
        var totalStudents   = await _context.Students.CountAsync();
        var activeStudents  = await _context.Students.CountAsync(s => s.Status == StudentStatus.Active);

        // Employees
        var totalEmployees  = await _context.Employees.CountAsync();
        var activeEmployees = await _context.Employees.CountAsync(e => e.IsActive);

        var employeesByRole = await _context.Employees
            .Where(e => e.IsActive)
            .GroupBy(e => e.Role)
            .Select(g => new RoleCountStat
            {
                Role  = g.Key.ToString(),
                Count = g.Count()
            })
            .ToListAsync();

        // Sections & Subjects
        var totalSections  = await _context.Sections.CountAsync();
        var totalSubjects  = await _context.Subjects.CountAsync();

        // Enrollment applications
        var totalApps    = await _context.EnrollmentApplications.CountAsync();
        var pending      = await _context.EnrollmentApplications.CountAsync(a => a.Status == EnrollmentApplicationStatus.Pending);
        var approved     = await _context.EnrollmentApplications.CountAsync(a => a.Status == EnrollmentApplicationStatus.Approved);
        var rejected     = await _context.EnrollmentApplications.CountAsync(a => a.Status == EnrollmentApplicationStatus.Rejected);

        // Active academic year
        var activeYear = await _context.AcademicYears
            .Where(a => a.Status == EduCore.API.Enums.AcademicYearStatus.Current)
            .Select(a => a.SchoolYear)
            .FirstOrDefaultAsync();

        return new AdminDashboardStatsResponse
        {
            TotalStudents             = totalStudents,
            ActiveStudents            = activeStudents,
            InactiveStudents          = totalStudents - activeStudents,
            TotalEmployees            = totalEmployees,
            ActiveEmployees           = activeEmployees,
            EmployeesByRole           = employeesByRole,
            TotalSections             = totalSections,
            TotalSubjects             = totalSubjects,
            TotalEnrollmentApplications = totalApps,
            PendingApplications       = pending,
            ApprovedApplications      = approved,
            RejectedApplications      = rejected,
            ActiveAcademicYear        = activeYear
        };
    }

    public async Task<PrincipalDashboardResponse> GetPrincipalDashboardAsync()
    {
        var response = new PrincipalDashboardResponse();

        // ── 1. School Overview ───────────────────────────────────────────────
        var activeYear = await _context.AcademicYears
            .Where(a => a.Status == EduCore.API.Enums.AcademicYearStatus.Current)
            .Select(a => a.SchoolYear)
            .FirstOrDefaultAsync();

        response.Overview = new SchoolOverview
        {
            TotalActiveStudents  = await _context.Students.CountAsync(s => s.Status == EduCore.API.Enums.StudentStatus.Active),
            TotalActiveEmployees = await _context.Employees.CountAsync(e => e.IsActive),
            TotalSections        = await _context.Sections.CountAsync(),
            TotalSubjects        = await _context.Subjects.CountAsync(),
            CurrentAcademicYear  = activeYear
        };

        // ── 2. Enrollment Pipeline ───────────────────────────────────────────
        var totalApps = await _context.EnrollmentApplications.CountAsync();
        response.EnrollmentPipeline = new EnrollmentPipelineStats
        {
            Total    = totalApps,
            Pending  = await _context.EnrollmentApplications.CountAsync(a => a.Status == EduCore.API.Enums.EnrollmentApplicationStatus.Pending),
            Approved = await _context.EnrollmentApplications.CountAsync(a => a.Status == EduCore.API.Enums.EnrollmentApplicationStatus.Approved),
            Rejected = await _context.EnrollmentApplications.CountAsync(a => a.Status == EduCore.API.Enums.EnrollmentApplicationStatus.Rejected)
        };

        // ── 3. Section Enrollment (headcount per section) ────────────────────
        response.SectionEnrollment = await _context.StudentSectionAssignments
            .Where(a => a.IsActive)
            .GroupBy(a => new
            {
                a.Section.ProgramOffering.GradeLevel.Name,
                a.Section.SectionName,
                a.Section.ProgramOffering.AcademicYear.SchoolYear
            })
            .Select(g => new SectionEnrollmentStat
            {
                GradeLevel   = g.Key.Name,
                SectionName  = g.Key.SectionName,
                StudentCount = g.Count(),
                AcademicYear = g.Key.SchoolYear
            })
            .OrderBy(s => s.GradeLevel)
            .ThenBy(s => s.SectionName)
            .ToListAsync();

        // ── 4. Subject Performance (avg grade + pass rate) ───────────────────
        var gradeData = await _context.Grades
            .Where(g => g.IsCompleted)
            .Join(_context.Subjects,
                  g => g.SubjectId,
                  s => s.Id,
                  (g, s) => new { SubjectName = s.SubjectName, FinalGrade = g.FinalGrade })
            .ToListAsync();

        response.SubjectPerformance = gradeData
            .GroupBy(x => x.SubjectName)
            .Select(g =>
            {
                var grades   = g.Select(x => x.FinalGrade).ToList();
                var avg      = grades.Average();
                var passRate = grades.Count == 0
                    ? 0
                    : (decimal)grades.Count(x => x >= 75) / grades.Count * 100;

                return new SubjectPerformanceStat
                {
                    SubjectName          = g.Key,
                    AverageGrade         = Math.Round(avg ?? 0, 2),
                    PassRate             = Math.Round(passRate, 2),
                    TotalStudentsGraded  = grades.Count
                };
            })
            .OrderBy(s => s.SubjectName)
            .ToList();

        // ── 5. Teacher Load ──────────────────────────────────────────────────
        var teacherAssignments = await _context.TeachingAssignments
            .Where(t => t.IsActive)
            .Select(t => new
            {
                EmployeeId = t.EmployeeId,
                TeacherName  = t.Employee.FirstName + " " + t.Employee.LastName,
                SubjectName  = t.Subject.SubjectName
            })
            .ToListAsync();

        response.TeacherLoad = teacherAssignments
            .GroupBy(t => new { t.EmployeeId, t.TeacherName })
            .Select(g => new TeacherLoadStat
            {
                EmployeeId    = g.Key.EmployeeId,
                FullName      = g.Key.TeacherName,
                ClassCount    = g.Count(),
                SubjectsTaught = g.Select(x => x.SubjectName).Distinct().ToList()
            })
            .OrderByDescending(t => t.ClassCount)
            .ToList();

        // ── 6. Student Performance Summary ───────────────────────────────────
        // Average all released grades per student, then check pass/fail
        var studentGradeAverages = await _context.Grades
            .Where(g => g.IsCompleted)
            .GroupBy(g => g.Enrollment.StudentId)
            .Select(g => new
            {
                StudentId    = g.Key,
                AverageGrade = g.Average(x => x.FinalGrade)
            })
            .ToListAsync();

        var totalGraded  = studentGradeAverages.Count;
        var passing      = studentGradeAverages.Count(s => s.AverageGrade >= 75);
        var failing      = totalGraded - passing;
        var overallAvg   = totalGraded > 0
            ? Math.Round((decimal)studentGradeAverages.Average(s => s.AverageGrade ?? 0), 2)
            : 0;
        var overallPass  = totalGraded > 0
            ? Math.Round((decimal)passing / totalGraded * 100, 2)
            : 0;

        response.StudentPerformance = new StudentPerformanceSummary
        {
            TotalGradedStudents = totalGraded,
            PassingStudents     = passing,
            FailingStudents     = failing,
            OverallPassRate     = overallPass,
            OverallAverageGrade = overallAvg
        };

        // ── 7. Employee Breakdown ────────────────────────────────────────────
        response.EmployeeBreakdown = await _context.Employees
            .Where(e => e.IsActive)
            .GroupBy(e => e.Role)
            .Select(g => new RoleCountStat
            {
                Role  = g.Key.ToString(),
                Count = g.Count()
            })
            .ToListAsync();

        return response;
    }
}
