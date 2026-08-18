using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class CreateNotificationRequest
{
    // Provide either UserId (personal) or TargetRole (broadcast to every active user in that role, or "All").
    public int? UserId { get; set; }

    [MaxLength(50)]
    public string? TargetRole { get; set; }

    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = "Info";
}

public class NotificationResponse
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ReadAt { get; set; }
}
