using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class DocumentSubmissionAppointment
{
    public int Id { get; set; }

    public int EnrollmentApplicationId { get; set; }
    public EnrollmentApplication EnrollmentApplication { get; set; } = null!;

    public DateTime AppointmentDate { get; set; }

    [MaxLength(20)]
    public string AppointmentTime { get; set; } = "9:00 AM";

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Completed, Missed, Cancelled, Rescheduled

    public int? ScheduledByUserId { get; set; }
    public User? ScheduledByUser { get; set; }

    public int? AssignedRegistrarId { get; set; }
    public Employee? AssignedRegistrar { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    [MaxLength(250)]
    public string? Remarks { get; set; }
}
