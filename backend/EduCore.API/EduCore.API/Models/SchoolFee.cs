using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using EduCore.API.Enums;

namespace EduCore.API.Models;

public class SchoolFee
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FeeName { get; set; } = string.Empty;

    public FeeType FeeType { get; set; } = FeeType.Tuition;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public int AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public int? GradeLevelId { get; set; }
    public GradeLevel? GradeLevel { get; set; }

    public bool IsMandatory { get; set; } = true;
    public bool IsActive { get; set; } = true;

    public bool IsDeleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
