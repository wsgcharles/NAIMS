using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class UpdateSubjectRequest
{
    [Required]
    public string SubjectCode { get; set; } = string.Empty;

    [Required]
    public string SubjectName { get; set; } = string.Empty;

    [Required]
    public int GradeLevelId { get; set; }

    public int? ProgramId { get; set; }

    public bool IsCoreSubject { get; set; }

    public string CurriculumVersion { get; set; } = "MATATAG-K10";

    public string SubjectType { get; set; } = "Core";

    public int? Semester { get; set; }

    public string? DomainCategory { get; set; }

    [Required]
    public int Units { get; set; }

    public bool IsActive { get; set; }
}