namespace EduCore.API.DTOs;

public class SectionResponse
{
    public int Id { get; set; }

    public int ProgramOfferingId { get; set; }
    
    public string ProgramOfferingName { get; set; } = string.Empty;

    public string SectionName { get; set; } = string.Empty;

    public int Capacity { get; set; }

    public int CurrentStudents { get; set; }

    public int? AdviserEmployeeId { get; set; }

    public string AdviserName { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}