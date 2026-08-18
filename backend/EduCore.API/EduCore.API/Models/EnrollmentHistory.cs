using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCore.API.Models;

public class EnrollmentHistory
{
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    [Required]
    public int AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    [Required]
    public int GradeLevelId { get; set; }
    public GradeLevel GradeLevel { get; set; } = null!;

    public int? SectionId { get; set; }
    public Section? Section { get; set; }

    [Required]
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(50)]
    public string EnrollmentStatus { get; set; } = "Enrolled";

    public int? EnrolledByEmployeeId { get; set; }
    public Employee? EnrolledByEmployee { get; set; }

    /// <summary>
    /// Immutable JSON snapshot of school year, grade, section, adviser, subject list, tuition, fees, discounts, and voucher info at time of enrollment.
    /// </summary>
    public string? SnapshotJson { get; set; }
}
