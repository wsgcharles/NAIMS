namespace EduCore.API.DTOs;

public class ApproveAndEnrollResponse
{
    public int StudentId { get; set; }

    public string StudentNumber { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// The system-generated temporary password.
    /// The Registrar must share this securely with the student.
    /// The student will be required to change it on first login.
    /// </summary>
    public string TemporaryPassword { get; set; } = string.Empty;

    public string ParentEmail { get; set; } = string.Empty;

    public string ParentTemporaryPassword { get; set; } = string.Empty;

    public string ApplicationNumber { get; set; } = string.Empty;

    public string Message { get; set; } = "Student enrolled successfully. Please share the temporary password securely with the student.";
}
