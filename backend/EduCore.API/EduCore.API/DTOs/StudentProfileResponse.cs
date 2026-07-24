namespace EduCore.API.DTOs;

public class StudentProfileResponse
{
    public int StudentId { get; set; }

    public string StudentNumber { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string GradeLevel { get; set; } = string.Empty;

    public string Section { get; set; } = string.Empty;

    public string AcademicYear { get; set; } = string.Empty;
}