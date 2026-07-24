using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class PromoteStudentRequest
{
    [Required]
    public int StudentId { get; set; }

    /// <summary>
    /// The academic year ID the student is being promoted into.
    /// Used to deactivate old assignment. New assignment created separately.
    /// </summary>
    [Required]
    public int AcademicYearId { get; set; }

    public string? Notes { get; set; }

    [Required]
    public int EmployeeId { get; set; }
}
