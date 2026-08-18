using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class CreateAnnouncementRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = "General";

    [Required]
    [MaxLength(200)]
    public string TargetRoles { get; set; } = "All";

    [Required]
    public int CreatedByEmployeeId { get; set; }
}

public class UpdateAnnouncementRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = "General";

    [Required]
    [MaxLength(200)]
    public string TargetRoles { get; set; } = "All";
}

public class AnnouncementResponse
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string TargetRoles { get; set; } = string.Empty;

    public bool IsPublished { get; set; }

    public DateTime? PublishedAt { get; set; }

    public bool IsArchived { get; set; }

    public string? CreatedByName { get; set; }

    public DateTime CreatedAt { get; set; }
}
