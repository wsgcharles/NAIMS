using System.ComponentModel.DataAnnotations;
using EduCore.API.Enums;

namespace EduCore.API.Models;

public class Enrollment
{
    public int Id { get; set; }

    [Required]
    [MaxLength(30)]
    public string EnrollmentNumber { get; set; } = string.Empty;

    public int? StudentId { get; set; }
    public Student? Student { get; set; }

    public int? EnrollmentApplicationId { get; set; }
    public EnrollmentApplication? EnrollmentApplication { get; set; }

    public int AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public int? GradeLevelId { get; set; }
    public GradeLevel? GradeLevel { get; set; }

    public int? SectionId { get; set; }
    public Section? Section { get; set; }

    public EnrollmentType EnrollmentType { get; set; }

    public EnrollmentStatus Status { get; set; }

    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;

    public int? ApprovedByEmployeeId { get; set; }
    public Employee? ApprovedBy { get; set; }

    public string? Remarks { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<Grade> Grades { get; set; }
        = new List<Grade>();
}