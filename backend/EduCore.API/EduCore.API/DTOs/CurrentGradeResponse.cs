namespace EduCore.API.DTOs;

public class CurrentGradeResponse
{
    public string Subject { get; set; } = "";

    public decimal? PrelimGrade { get; set; }

    public decimal? MidtermGrade { get; set; }

    public decimal? FinalGrade { get; set; }

    public string Remarks { get; set; } = "";
}