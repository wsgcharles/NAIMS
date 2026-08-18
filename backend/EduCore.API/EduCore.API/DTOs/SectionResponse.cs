namespace EduCore.API.DTOs;

public class SectionResponse
{
    public int Id { get; set; }

    public int ProgramOfferingId { get; set; }
    
    public string ProgramOfferingName { get; set; } = string.Empty;

    public int AcademicYearId { get; set; }

    public string SchoolYear { get; set; } = string.Empty;

    public string Semester { get; set; } = string.Empty;

    public int GradeLevelId { get; set; }

    public string GradeLevelName { get; set; } = string.Empty;

    public int? ProgramId { get; set; }

    public string TrackCode { get; set; } = string.Empty;

    public string StrandCode { get; set; } = string.Empty;

    public string SectionName { get; set; } = string.Empty;

    public int Capacity { get; set; }

    public int CurrentStudents { get; set; }

    public int RemainingSlots { get; set; }

    public int? AdviserEmployeeId { get; set; }

    public string AdviserName { get; set; } = string.Empty;

    public bool HasAdviser { get; set; }

    public bool IsActive { get; set; }

    public string Status { get; set; } = "Active";

    public string ReadinessStatus { get; set; } = "Ready"; // Ready, Warning, Incomplete, Full

    public string SectionHealth { get; set; } = "Excellent"; // Excellent, Good, Needs Attention, Configuration Required

    public int AssignedSubjectsCount { get; set; }

    public int RequiredSubjectsCount { get; set; }

    public int AssignedTeachersCount { get; set; }

    public int RequiredTeachersCount { get; set; }

    public bool IsSubjectComplete { get; set; }

    public bool IsTeacherComplete { get; set; }

    public List<SectionSubjectDetailDto> Subjects { get; set; } = new();

    public List<SectionEnrolledStudentDto> EnrolledStudents { get; set; } = new();
}

public class SectionEnrolledStudentDto
{
    public int StudentId { get; set; }
    public string StudentNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
}

public class SectionManagementStatsDto
{
    public int TotalSections { get; set; }
    public int ActiveSections { get; set; }
    public int FullSections { get; set; }
    public int SectionsMissingAdviser { get; set; }
    public int SectionsMissingTeachers { get; set; }
    public double AverageUtilization { get; set; }
}

public class AssignSectionTeacherRequest
{
    public int SubjectId { get; set; }
    public int EmployeeId { get; set; }
}

public class AssignSectionSubjectsRequest
{
    public List<int> SubjectIds { get; set; } = new();
}