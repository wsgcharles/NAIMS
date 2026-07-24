using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class UpdateStudentSectionAssignmentRequest
{
    [Required]
    public int StudentId { get; set; }

    [Required]
    public int SectionId { get; set; }

    [Required]
    public bool IsActive { get; set; }
}