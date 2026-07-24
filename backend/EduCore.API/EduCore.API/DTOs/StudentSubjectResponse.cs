namespace EduCore.API.DTOs;

public class StudentSubjectResponse
{
    public int SubjectId { get; set; }

    public string SubjectName { get; set; } = string.Empty;

    public string Teacher { get; set; } = string.Empty;

    public string Section { get; set; } = string.Empty;
}