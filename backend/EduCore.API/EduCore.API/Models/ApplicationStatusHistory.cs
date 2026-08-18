using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class ApplicationStatusHistory
{
    public int Id { get; set; }

    public int EnrollmentApplicationId { get; set; }
    public EnrollmentApplication EnrollmentApplication { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string FromStatus { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string ToStatus { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Remarks { get; set; }

    public int? ChangedByUserId { get; set; }
    public User? ChangedByUser { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
