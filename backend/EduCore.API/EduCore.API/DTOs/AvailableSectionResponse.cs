namespace EduCore.API.DTOs;

public class SectionSubjectDetailDto
{
    public int SubjectId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public int Units { get; set; }
    public bool IsCoreSubject { get; set; }
    public int? TeacherEmployeeId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public bool HasTeacher { get; set; }
}


public class AvailableSectionResponse
{
    public int SectionId { get; set; }
    public string SectionName { get; set; } = string.Empty;
    public bool Recommended { get; set; }
    public string RecommendationSummary { get; set; } = string.Empty;
    public List<string> RecommendationReasons { get; set; } = new();

    // Readiness & Health
    public string ReadinessStatus { get; set; } = "Ready"; // Ready, Warning, Incomplete, Full
    public string SectionHealth { get; set; } = "Excellent"; // Excellent, Good, Needs Attention, Configuration Required

    // Capacities & Metrics
    public int RemainingSlots { get; set; }
    public int Capacity { get; set; }
    public int CurrentEnrollment { get; set; }
    public int EnrollmentPercentage { get; set; }

    // Adviser & Staffing
    public string AdviserName { get; set; } = string.Empty;
    public int? AdviserEmployeeId { get; set; }
    public bool HasAdviser { get; set; }

    // Subject & Teacher Completeness
    public int AssignedSubjects { get; set; }
    public int RequiredSubjects { get; set; }
    public int AssignedTeachers { get; set; }
    public int RequiredTeachers { get; set; }
    public bool IsSubjectComplete { get; set; }
    public bool IsTeacherComplete { get; set; }

    // Program Hierarchy
    public string SchoolYear { get; set; } = string.Empty;
    public string GradeLevelName { get; set; } = string.Empty;
    public string TrackCode { get; set; } = string.Empty;
    public string StrandCode { get; set; } = string.Empty;

    // Subject Roster & Timetable Details
    public List<SectionSubjectDetailDto> Subjects { get; set; } = new();

    // Warnings & Selectability
    public List<string> Warnings { get; set; } = new();
    public List<string> ReasonsNotSelectable { get; set; } = new();
    public bool IsSelectable { get; set; }
}

public class SectionValidationResultDto
{
    public bool IsValid { get; set; }
    public string Code { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
}
