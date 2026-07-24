using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class StudentHistory
{
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }

    public Student Student { get; set; } = null!;

    [Required]
    public string Action { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public DateTime DateOccurred { get; set; } = DateTime.UtcNow;

    public int? EmployeeId { get; set; }

    public Employee? Employee { get; set; }
}