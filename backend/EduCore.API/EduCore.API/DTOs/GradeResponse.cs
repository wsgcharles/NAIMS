namespace EduCore.API.DTOs;

public class GradeResponse
{
    public int Id { get; set; }

    public int EnrollmentId { get; set; }

    public string StudentName { get; set; } = string.Empty;

    public int SubjectId { get; set; }

    public string SubjectName { get; set; } = string.Empty;

    public int TeachingAssignmentId { get; set; }

    public string TeacherName { get; set; } = string.Empty;

    public decimal? PrelimGrade { get; set; }

    public decimal? MidtermGrade { get; set; }

    public decimal? FinalGrade { get; set; }

    public decimal? FinalAverage { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime CreatedAt { get; set; }
}