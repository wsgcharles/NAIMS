namespace EduCore.API.DTOs;

public class MyClassResponse
{
    public int TeachingAssignmentId { get; set; }

    public int SubjectId { get; set; }

    public string SubjectName { get; set; } = string.Empty;

    public int SectionId { get; set; }

    public string SectionName { get; set; } = string.Empty;

    public int AcademicYearId { get; set; }

    public string AcademicYear { get; set; } = string.Empty;

    public int StudentCount { get; set; }
}