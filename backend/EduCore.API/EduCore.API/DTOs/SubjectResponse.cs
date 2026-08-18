namespace EduCore.API.DTOs;

public class SubjectResponse
{
    public int Id { get; set; }

    public string SubjectCode { get; set; } = string.Empty;

    public string SubjectName { get; set; } = string.Empty;

    public int GradeLevelId { get; set; }

    public string GradeLevel { get; set; } = string.Empty;

    public int? ProgramId { get; set; }

    public string? ProgramCode { get; set; }

    public string? ProgramName { get; set; }

    public bool IsCoreSubject { get; set; }

    public string CurriculumVersion { get; set; } = "MATATAG-K10";

    public string SubjectType { get; set; } = "Core";

    public int? Semester { get; set; }

    public string? DomainCategory { get; set; }

    public int Units { get; set; }

    public bool IsActive { get; set; }
}