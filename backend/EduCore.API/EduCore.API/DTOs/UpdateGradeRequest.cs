using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class UpdateGradeRequest
{
    [Required]
    public int EnrollmentId { get; set; }

    [Required]
    public int SubjectId { get; set; }

    [Required]
    public int TeachingAssignmentId { get; set; }

    [Range(0, 100)]
    public decimal? PrelimGrade { get; set; }

    [Range(0, 100)]
    public decimal? MidtermGrade { get; set; }

    [Range(0, 100)]
    public decimal? FinalGrade { get; set; }

    [Range(0, 100)]
    public decimal? FinalAverage { get; set; }

    public bool IsCompleted { get; set; }
}