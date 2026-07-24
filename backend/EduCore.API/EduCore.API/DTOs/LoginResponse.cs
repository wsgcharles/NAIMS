namespace EduCore.API.DTOs;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool MustChangePassword { get; set; }
    public bool IsFirstLogin { get; set; }
    public string NextAction { get; set; } = "DASHBOARD"; // DASHBOARD | CHANGE_PASSWORD | ACCOUNT_LOCKED
    public string? Message { get; set; }
}