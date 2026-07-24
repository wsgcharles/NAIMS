using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class CreateStudentSectionAssignmentRequest
{
    [Required]
    public int StudentId { get; set; }

    [Required]
    public int SectionId { get; set; }
}