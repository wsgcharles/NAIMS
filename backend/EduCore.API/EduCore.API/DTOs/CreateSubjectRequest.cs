using System.ComponentModel.DataAnnotations;

namespace EduCore.API.DTOs;

public class CreateSubjectRequest
{
    [Required]
    public string SubjectCode { get; set; } = string.Empty;

    [Required]
    public string SubjectName { get; set; } = string.Empty;

    [Required]
    public int GradeLevelId { get; set; }

    public bool IsCoreSubject { get; set; }

    [Required]
    public int Units { get; set; }
}