namespace EduCore.API.DTOs;

public class AcademicYearResponse
{
    public int Id { get; set; }
    public string SchoolYear { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    /// <summary>"Upcoming", "Current", "Completed", or "Archived"</summary>
    public string Status { get; set; } = string.Empty;
    public bool IsActive { get; set; }

    // Enrollment controls
    public DateTime? EnrollmentStartDate { get; set; }
    public DateTime? EnrollmentEndDate { get; set; }
    public bool IsEnrollmentOpen { get; set; }
    public bool IsReturningEnrollmentOpen { get; set; }

    // Semester
    public string CurrentSemester { get; set; } = "1st Semester";

    // School calendar
    public DateTime? ClassesStartDate { get; set; }
    public DateTime? ClassesEndDate { get; set; }
    public DateTime? GraduationDate { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}