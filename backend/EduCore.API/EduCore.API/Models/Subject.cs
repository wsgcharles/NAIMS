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

    /// <summary>
    /// Nullable link to AcademicProgram (Strand).
    /// Null = Common/Core subject for the applicable GradeLevel.
    /// Non-null = Strand-specific subject for Senior High School (Grades 11-12).
    /// </summary>
    public int? ProgramId { get; set; }

    public AcademicProgram? Program { get; set; }

    public bool IsCoreSubject { get; set; }

    [Required]
    [MaxLength(50)]
    public string CurriculumVersion { get; set; } = "MATATAG-K10";

    [Required]
    [MaxLength(30)]
    public string SubjectType { get; set; } = "Core";

    public int? Semester { get; set; }

    [MaxLength(50)]
    public string? DomainCategory { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<TeachingAssignment> TeachingAssignments { get; set; }
        = new List<TeachingAssignment>();

    public ICollection<Grade> Grades { get; set; }
        = new List<Grade>();
}