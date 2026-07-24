using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class GraduateStudentRequest
{
    [Required]
    public int StudentId { get; set; }

    /// <summary>
    /// The school year the student is graduating from, e.g. "2025-2026".
    /// </summary>
    [Required]
    public string SchoolYear { get; set; } = string.Empty;

    public string? Notes { get; set; }

    [Required]
    public int EmployeeId { get; set; }
}
