namespace EduCore.API.DTOs;

public class StudentHistoryResponse
{
    public int Id { get; set; }

    public int StudentId { get; set; }

    public string Action { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime DateOccurred { get; set; }

    public int? EmployeeId { get; set; }
    
    public string? PerformedBy { get; set; }
}
