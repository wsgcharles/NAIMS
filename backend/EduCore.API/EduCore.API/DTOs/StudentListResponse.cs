namespace EduCore.API.DTOs;

public class StudentListResponse
{
    public int StudentId { get; set; }

    public string StudentNumber { get; set; } = "";

    public string FullName { get; set; } = "";

    public string GradeLevel { get; set; } = "";

    public string Section { get; set; } = "";

    public string AcademicYear { get; set; } = "";

    public bool IsActive { get; set; }
}