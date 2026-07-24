namespace EduCore.API.DTOs.ParentPortal;

public class ChildGradeResponse
{
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string TeacherName { get; set; } = string.Empty;
    public decimal? PrelimGrade { get; set; }
    public decimal? MidtermGrade { get; set; }
    public decimal? FinalGrade { get; set; }
    public decimal? FinalAverage { get; set; }
    public string Remarks { get; set; } = string.Empty;
}
