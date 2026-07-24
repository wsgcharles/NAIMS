namespace EduCore.API.DTOs;

public class EnrollmentResponse
{
    public int Id { get; set; }

    public string ApplicationNumber { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string GradeApplyingFor { get; set; } = string.Empty;

    public string PreviousSchool { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public bool IsApproved { get; set; }

    public DateTime CreatedAt { get; set; }
}