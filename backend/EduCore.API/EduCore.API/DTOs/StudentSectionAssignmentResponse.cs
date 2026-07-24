namespace EduCore.API.DTOs;

public class StudentSectionAssignmentResponse
{
    public int Id { get; set; }

    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;

    public int SectionId { get; set; }
    public string SectionName { get; set; } = string.Empty;

    public int AcademicYearId { get; set; }
    public string AcademicYear { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public DateTime AssignedAt { get; set; }
}