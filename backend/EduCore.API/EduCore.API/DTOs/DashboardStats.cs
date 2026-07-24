namespace EduCore.API.DTOs;

// ── Admin Dashboard ──────────────────────────────────────────────────────────

public class AdminDashboardStatsResponse
{
    public int TotalStudents { get; set; }
    public int ActiveStudents { get; set; }
    public int InactiveStudents { get; set; }

    public int TotalEmployees { get; set; }
    public int ActiveEmployees { get; set; }

    public List<RoleCountStat> EmployeesByRole { get; set; } = new();

    public int TotalSections { get; set; }
    public int TotalSubjects { get; set; }

    public int TotalEnrollmentApplications { get; set; }
    public int PendingApplications { get; set; }
    public int ApprovedApplications { get; set; }
    public int RejectedApplications { get; set; }

    public string? ActiveAcademicYear { get; set; }
}

// ── Principal Dashboard ──────────────────────────────────────────────────────

public class PrincipalDashboardResponse
{
    /// <summary>School-wide key figures shown as summary cards.</summary>
    public SchoolOverview Overview { get; set; } = new();

    /// <summary>Enrollment application funnel stats.</summary>
    public EnrollmentPipelineStats EnrollmentPipeline { get; set; } = new();

    /// <summary>How many students are in each section (by grade).</summary>
    public List<SectionEnrollmentStat> SectionEnrollment { get; set; } = new();

    /// <summary>Average final grade and pass rate per subject, school-wide.</summary>
    public List<SubjectPerformanceStat> SubjectPerformance { get; set; } = new();

    /// <summary>How many classes each active teacher is handling.</summary>
    public List<TeacherLoadStat> TeacherLoad { get; set; } = new();

    /// <summary>Overall student performance metrics.</summary>
    public StudentPerformanceSummary StudentPerformance { get; set; } = new();

    /// <summary>Breakdown of employees by their role.</summary>
    public List<RoleCountStat> EmployeeBreakdown { get; set; } = new();
}

// ── Shared stat building blocks ──────────────────────────────────────────────

public class SchoolOverview
{
    public int TotalActiveStudents { get; set; }
    public int TotalActiveEmployees { get; set; }
    public int TotalSections { get; set; }
    public int TotalSubjects { get; set; }
    public string? CurrentAcademicYear { get; set; }
}

public class EnrollmentPipelineStats
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
}

public class SectionEnrollmentStat
{
    public string GradeLevel { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public int StudentCount { get; set; }
    public string AcademicYear { get; set; } = string.Empty;
}

public class SubjectPerformanceStat
{
    public string SubjectName { get; set; } = string.Empty;

    /// <summary>Average final grade of all released grades for this subject.</summary>
    public decimal AverageGrade { get; set; }

    /// <summary>Percentage of students with a final grade of 75 or above.</summary>
    public decimal PassRate { get; set; }

    public int TotalStudentsGraded { get; set; }
}

public class TeacherLoadStat
{
    public int EmployeeId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int ClassCount { get; set; }
    public List<string> SubjectsTaught { get; set; } = new();
}

public class StudentPerformanceSummary
{
    /// <summary>Total number of graded students (with at least one released grade).</summary>
    public int TotalGradedStudents { get; set; }

    /// <summary>Students whose average final grade is >= 75.</summary>
    public int PassingStudents { get; set; }

    /// <summary>Students whose average final grade is below 75.</summary>
    public int FailingStudents { get; set; }

    /// <summary>Overall pass rate across the school (%).</summary>
    public decimal OverallPassRate { get; set; }

    /// <summary>School-wide average final grade.</summary>
    public decimal OverallAverageGrade { get; set; }
}

public class RoleCountStat
{
    public string Role { get; set; } = string.Empty;
    public int Count { get; set; }
}
