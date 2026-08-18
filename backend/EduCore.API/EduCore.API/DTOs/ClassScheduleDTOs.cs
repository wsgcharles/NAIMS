using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class CreateClassScheduleRequest
{
    [Required]
    public int TeachingAssignmentId { get; set; }

    [Required]
    public string DayOfWeek { get; set; } = string.Empty;

    [Required]
    public TimeSpan StartTime { get; set; }

    [Required]
    public TimeSpan EndTime { get; set; }

    [MaxLength(100)]
    public string? Room { get; set; }
}

public class UpdateClassScheduleRequest : CreateClassScheduleRequest
{
}

public class ClassScheduleResponse
{
    public int Id { get; set; }

    public int TeachingAssignmentId { get; set; }

    public string SubjectName { get; set; } = string.Empty;

    public string Teacher { get; set; } = string.Empty;

    public string Section { get; set; } = string.Empty;

    public string DayOfWeek { get; set; } = string.Empty;

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public string? Room { get; set; }
}
