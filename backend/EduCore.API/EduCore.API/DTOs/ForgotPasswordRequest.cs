using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
