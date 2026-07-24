namespace EduCore.API.DTOs;

public class CreateStudentHistoryRequest
{
    public int StudentId { get; set; }

    public string Action { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int? EmployeeId { get; set; }
}