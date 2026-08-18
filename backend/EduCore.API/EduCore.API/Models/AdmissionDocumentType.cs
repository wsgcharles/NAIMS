using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class AdmissionDocumentType
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    public bool IsRequired { get; set; } = true;

    [MaxLength(50)]
    public string ApplicableEducationLevel { get; set; } = "All"; // Elementary, JuniorHighSchool, SeniorHighSchool, All

    public int DisplayOrder { get; set; } = 1;

    public bool IsActive { get; set; } = true;
}
