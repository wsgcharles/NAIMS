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

    public bool IsReleased { get; set; }

    public DateTime DateEncoded { get; set; }
}