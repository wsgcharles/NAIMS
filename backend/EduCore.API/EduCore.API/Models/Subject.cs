using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class Subject
{
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string SubjectCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string SubjectName { get; set; } = string.Empty;

    public int Units { get; set; }

    public int GradeLevelId { get; set; }

    public GradeLevel GradeLevel { get; set; } = null!;

    public bool IsCoreSubject { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<TeachingAssignment> TeachingAssignments { get; set; }
        = new List<TeachingAssignment>();

    public ICollection<Grade> Grades { get; set; }
        = new List<Grade>();
}