using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class PasswordResetCode
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public User User { get; set; } = null!;

    [Required]
    [MaxLength(128)]
    public string CodeHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAt { get; set; }

    public bool Used { get; set; } = false;

    public DateTime? UsedAt { get; set; }
}
