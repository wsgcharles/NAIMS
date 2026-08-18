using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class ResetPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Code { get; set; } = string.Empty;

    [Required]
    public string NewPassword { get; set; } = string.Empty;
}
