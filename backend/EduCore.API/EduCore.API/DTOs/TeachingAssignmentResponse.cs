namespace EduCore.API.DTOs;

public class TeachingAssignmentResponse
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public string EmployeeName { get; set; } = string.Empty;

    public int SubjectId { get; set; }

    public string SubjectName { get; set; } = string.Empty;

    public int SectionId { get; set; }

    public string SectionName { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}