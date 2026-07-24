using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class CreateSectionRequest
{
    [Required]
    public int ProgramOfferingId { get; set; }

    [Required]
    public string SectionName { get; set; } = string.Empty;

    [Required]
    public int Capacity { get; set; }

    public int? AdviserEmployeeId { get; set; }
}