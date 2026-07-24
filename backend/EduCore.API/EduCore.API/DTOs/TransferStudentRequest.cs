using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class TransferStudentRequest
{
    [Required]
    public int StudentId { get; set; }

    [Required]
    public string DestinationSchool { get; set; } = string.Empty;

    public string? Reason { get; set; }

    [Required]
    public int EmployeeId { get; set; }
}
