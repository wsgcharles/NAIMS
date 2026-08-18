using EduCore.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class Grade
{
    public int Id { get; set; }

    public int EnrollmentId { get; set; }

    public Enrollment Enrollment { get; set; } = null!;

    public int SubjectId { get; set; }

    public Subject Subject { get; set; } = null!;

    public int TeachingAssignmentId { get; set; }

    public TeachingAssignment TeachingAssignment { get; set; } = null!;

    [Range(0, 100)]
    public decimal? PrelimGrade { get; set; }

    [Range(0, 100)]
    public decimal? MidtermGrade { get; set; }

    [Range(0, 100)]
    public decimal? FinalGrade { get; set; }

    [Range(0, 100)]
    public decimal? FinalAverage { get; set; }

    public bool IsCompleted { get; set; }

    [MaxLength(200)]
    public string? Remarks { get; set; }

    // Academic Approval Workflow Fields
    public GradeStatus Status { get; set; } = GradeStatus.Draft;

    public DateTime? SubmittedAt { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public int? ApprovedByEmployeeId { get; set; }

    public Employee? ApprovedByEmployee { get; set; }

    [MaxLength(500)]
    public string? ReviewerRemarks { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}