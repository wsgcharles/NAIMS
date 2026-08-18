using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class GradeApprovalItemDto
{
    public int GradeId { get; set; }
    public int TeachingAssignmentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentNumber { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public string GradeLevelName { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public string Semester { get; set; } = "1st Semester";
    public decimal? PrelimGrade { get; set; }
    public decimal? MidtermGrade { get; set; }
    public decimal? FinalGrade { get; set; }
    public decimal? FinalAverage { get; set; }
    public string Status { get; set; } = "Submitted";
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedByTeacherOrAdmin { get; set; }
    public string? ReviewerRemarks { get; set; }
}

public class ApproveGradeRequest
{
    public string? Remarks { get; set; }
}

public class RejectGradeRequest
{
    [Required]
    [MaxLength(500)]
    public string Remarks { get; set; } = string.Empty;
}

public class SubmitGradeBatchRequest
{
    [Required]
    public int TeachingAssignmentId { get; set; }
}

public class ReleaseGradeBatchRequest
{
    [Required]
    public int TeachingAssignmentId { get; set; }
}
