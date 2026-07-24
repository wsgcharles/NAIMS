namespace EduCore.API.DTOs.ParentPortal;

public class ChildSummaryResponse
{
    public int StudentId { get; set; }
    public string StudentNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CurrentGradeLevel { get; set; } = string.Empty;
    public string CurrentSection { get; set; } = string.Empty;
}
