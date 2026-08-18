namespace EduCore.API.Models;

public class AuditLog
{
    public int Id { get; set; }

    public int? UserId { get; set; }
    public User? User { get; set; }

    public string? UserEmail { get; set; }

    public string Action { get; set; } = string.Empty;

    public string? EntityType { get; set; }

    public string? EntityId { get; set; }

    public string? Details { get; set; }

    public string? IpAddress { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
