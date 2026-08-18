using System.ComponentModel.DataAnnotations;
using EduCore.API.Enums;

namespace EduCore.API.Models;

public class Attendance
{
    public int Id { get; set; }

    public int TeachingAssignmentId { get; set; }
    public TeachingAssignment TeachingAssignment { get; set; } = null!;

    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;

    public DateTime Date { get; set; }

    public AttendanceStatus Status { get; set; }

    [MaxLength(250)]
    public string? Remarks { get; set; }

    public int? RecordedByEmployeeId { get; set; }
    public Employee? RecordedByEmployee { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
