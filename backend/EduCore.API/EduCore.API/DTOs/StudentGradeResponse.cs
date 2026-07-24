namespace EduCore.API.DTOs;

public class StudentGradeResponse
{
    public string Subject { get; set; } = string.Empty;

    public string Teacher { get; set; } = string.Empty;

    public decimal? PrelimGrade { get; set; }

    public decimal? MidtermGrade { get; set; }

    public decimal? FinalGrade { get; set; }

    public string Remarks { get; set; } = string.Empty;
}