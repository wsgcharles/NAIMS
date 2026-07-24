using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class Section
{
    public int Id { get; set; }

    public int ProgramOfferingId { get; set; }

    public ProgramOffering ProgramOffering { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string SectionName { get; set; } = string.Empty;

    [Required]
    public int Capacity { get; set; }

    public int? AdviserEmployeeId { get; set; }

    public Employee? Adviser { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<StudentSectionAssignment> StudentAssignments { get; set; }
        = new List<StudentSectionAssignment>();

    public ICollection<TeachingAssignment> TeachingAssignments { get; set; }
        = new List<TeachingAssignment>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}