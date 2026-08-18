using EduCore.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class AcademicYear
{
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string SchoolYear { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public AcademicYearStatus Status { get; set; } = AcademicYearStatus.Upcoming;

    // Enrollment period controls
    public DateTime? EnrollmentStartDate { get; set; }
    public DateTime? EnrollmentEndDate { get; set; }

    /// <summary>Controls whether new / transferee applicants can submit applications online.</summary>
    public bool IsEnrollmentOpen { get; set; } = false;

    /// <summary>Controls whether returning students can submit re-enrollment requests.</summary>
    public bool IsReturningEnrollmentOpen { get; set; } = false;

    // Semester tracking
    [MaxLength(20)]
    public string CurrentSemester { get; set; } = "1st Semester";

    // School calendar dates (optional, for future modules)
    public DateTime? ClassesStartDate { get; set; }
    public DateTime? ClassesEndDate { get; set; }
    public DateTime? GraduationDate { get; set; }

    // Navigation properties
    public ICollection<ProgramOffering> ProgramOfferings { get; set; }
    = new List<ProgramOffering>();

    public ICollection<StudentSectionAssignment> StudentAssignments { get; set; }
    = new List<StudentSectionAssignment>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<TeachingAssignment> TeachingAssignments { get; set; }
    = new List<TeachingAssignment>();
}