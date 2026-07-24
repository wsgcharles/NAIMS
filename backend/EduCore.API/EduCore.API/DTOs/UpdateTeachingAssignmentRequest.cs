using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class UpdateTeachingAssignmentRequest
{
    [Required]
    public int EmployeeId { get; set; }

    [Required]
    public int SubjectId { get; set; }

    [Required]
    public int SectionId { get; set; }

    public bool IsActive { get; set; }
}