namespace EduCore.API.DTOs;

public class StudentResponse
{
    public int Id { get; set; }

    public string StudentNumber { get; set; } = string.Empty;

    public string LRN { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public string? TemporaryPassword { get; set; }
}