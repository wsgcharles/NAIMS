namespace EduCore.API.DTOs;

public class TeacherGradeResponse
{
    public int GradeId { get; set; }

    public int StudentId { get; set; }

    public string StudentNumber { get; set; } = string.Empty;

    public string StudentName { get; set; } = string.Empty;

    public decimal? PrelimGrade { get; set; }

    public decimal? MidtermGrade { get; set; }

    public decimal? FinalGrade { get; set; }

    public decimal? FinalAverage { get; set; }

    public string Remarks { get; set; } = string.Empty;

    /// <summary>Workflow status: Draft, Submitted, Approved, Released, Rejected</summary>
    public string Status { get; set; } = "Draft";

    public DateTime? SubmittedAt { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public string? ReviewerRemarks { get; set; }

    /// <summary>True if Status is Draft or Rejected</summary>
    public bool CanEdit { get; set; } = true;

    public bool IsReleased { get; set; }

    public DateTime DateEncoded { get; set; }
}