using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class CreateAcademicYearRequest
{
    [Required]
    public string SchoolYear { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }
}