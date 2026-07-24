using System.ComponentModel.DataAnnotations;
using EduCore.API.Enums;

namespace EduCore.API.DTOs;

public class GradeLevelResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public string EducationLevel { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateGradeLevelRequest
{
    [Required]
    [MaxLength(20)]
    public string Name { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }

    [Required]
    public EducationLevel EducationLevel { get; set; }

    public bool IsActive { get; set; } = true;
}

public class UpdateGradeLevelRequest
{
    [Required]
    [MaxLength(20)]
    public string Name { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }

    [Required]
    public EducationLevel EducationLevel { get; set; }

    public bool IsActive { get; set; } = true;
}
