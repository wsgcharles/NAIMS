using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class Announcement
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = "General";

    // Comma-separated list of UserRole names this announcement targets, or "All".
    [Required]
    [MaxLength(200)]
    public string TargetRoles { get; set; } = "All";

    public bool IsPublished { get; set; } = false;

    public DateTime? PublishedAt { get; set; }

    public bool IsArchived { get; set; } = false;

    public int? CreatedByEmployeeId { get; set; }
    public Employee? CreatedByEmployee { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
