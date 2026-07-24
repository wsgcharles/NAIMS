namespace EduCore.API.DTOs;

public class AcademicYearResponse
{
    public int Id { get; set; }

    public string SchoolYear { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }
}