using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class TeachingAssignment
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    public int SubjectId { get; set; }

    public Subject Subject { get; set; } = null!;

    public int SectionId { get; set; }

    public Section Section { get; set; } = null!;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Grade> Grades { get; set; }
        = new List<Grade>();
}