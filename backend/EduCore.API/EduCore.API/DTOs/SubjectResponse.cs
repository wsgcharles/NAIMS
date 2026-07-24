namespace EduCore.API.DTOs;

public class SubjectResponse
{
    public int Id { get; set; }

    public string SubjectCode { get; set; } = string.Empty;

    public string SubjectName { get; set; } = string.Empty;

    public int GradeLevelId { get; set; }

    public string GradeLevel { get; set; } = string.Empty;

    public bool IsCoreSubject { get; set; }

    public int Units { get; set; }

    public bool IsActive { get; set; }
}