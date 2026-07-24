using System.ComponentModel.DataAnnotations;
using EduCore.API.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; } = UserRole.Student;

    public bool IsActive { get; set; } = true;

    public bool IsEmailVerified { get; set; } = false;

    public bool MustChangePassword { get; set; } = true;

    public bool IsFirstLogin { get; set; } = true;

    public DateTime? PasswordChangedAt { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public DateTime? AccountActivatedAt { get; set; }

    [MaxLength(128)]
    public string? PasswordResetTokenHash { get; set; }

    public DateTime? PasswordResetTokenExpiry { get; set; }

    public int FailedLoginCount { get; set; } = 0;

    public DateTime? LockoutEnd { get; set; }

    public DateTime? LastFailedLogin { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Student? Student { get; set; }
    public Employee? Employee { get; set; }
    public Parent? Parent { get; set; }
}