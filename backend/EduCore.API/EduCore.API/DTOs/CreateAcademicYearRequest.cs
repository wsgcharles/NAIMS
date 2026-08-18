using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class CreateAcademicYearRequest
{
    [Required]
    [MaxLength(20)]
    public string SchoolYear { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }

    // Enrollment controls
    public DateTime? EnrollmentStartDate { get; set; }
    public DateTime? EnrollmentEndDate { get; set; }
    public bool IsEnrollmentOpen { get; set; } = false;
    public bool IsReturningEnrollmentOpen { get; set; } = false;

    // Semester
    [MaxLength(20)]
    public string CurrentSemester { get; set; } = "1st Semester";

    // School calendar (optional)
    public DateTime? ClassesStartDate { get; set; }
    public DateTime? ClassesEndDate { get; set; }
    public DateTime? GraduationDate { get; set; }
}