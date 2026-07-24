using System.ComponentModel.DataAnnotations;
using EduCore.API.Enums;

namespace EduCore.API.Models;

public class EmailLog
{
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string RecipientEmail { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string TemplateName { get; set; } = string.Empty;

    public EmailStatus Status { get; set; } = EmailStatus.Pending;

    public int RetryCount { get; set; } = 0;

    [MaxLength(500)]
    public string? ErrorMessage { get; set; }

    public DateTime SentAt { get; set; } = DateTime.UtcNow;
}
