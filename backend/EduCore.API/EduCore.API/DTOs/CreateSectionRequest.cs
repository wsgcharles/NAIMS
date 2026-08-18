using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class CreateSectionRequest
{
    public int? ProgramOfferingId { get; set; }

    public int? AcademicYearId { get; set; }

    public int? GradeLevelId { get; set; }

    public int? ProgramId { get; set; }

    [Required]
    [MaxLength(100)]
    public string SectionName { get; set; } = string.Empty;

    [Required]
    [Range(1, 200)]
    public int Capacity { get; set; }

    public int? AdviserEmployeeId { get; set; }

    public bool IsActive { get; set; } = true;
}