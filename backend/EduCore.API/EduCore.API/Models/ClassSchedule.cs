using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class ClassSchedule
{
    public int Id { get; set; }

    public int TeachingAssignmentId { get; set; }
    public TeachingAssignment TeachingAssignment { get; set; } = null!;

    public DayOfWeek DayOfWeek { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    [MaxLength(100)]
    public string? Room { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
