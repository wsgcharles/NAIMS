using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class StudentSectionAssignment
{
    public int Id { get; set; }

    [Required]
    public int StudentId { get; set; }

    public Student Student { get; set; } = null!;

    [Required]
    public int SectionId { get; set; }

    public Section Section { get; set; } = null!;

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    public bool IsActive { get; set; } = true;
}