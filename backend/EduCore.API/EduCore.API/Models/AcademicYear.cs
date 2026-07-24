using EduCore.API.Enums;
using System.ComponentModel.DataAnnotations;
namespace EduCore.API.Models;

public class AcademicYear
{
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string SchoolYear { get; set; } = string.Empty;

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public AcademicYearStatus Status { get; set; } = AcademicYearStatus.Upcoming;

    public ICollection<ProgramOffering> ProgramOfferings { get; set; }
    = new List<ProgramOffering>();

    public ICollection<StudentSectionAssignment> StudentAssignments { get; set; }
    = new List<StudentSectionAssignment>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<TeachingAssignment> TeachingAssignments { get; set; }
    = new List<TeachingAssignment>();
}