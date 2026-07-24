namespace EduCore.API.DTOs.ParentPortal;

public class ChildSubjectResponse
{
    public int TeachingAssignmentId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public int Units { get; set; }
}
