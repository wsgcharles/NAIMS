using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class UpdateTeacherGradeRequest
{
    [Range(0, 100)]
    public decimal? PrelimGrade { get; set; }

    [Range(0, 100)]
    public decimal? MidtermGrade { get; set; }

    [Range(0, 100)]
    public decimal? FinalGrade { get; set; }
}