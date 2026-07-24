using System.ComponentModel.DataAnnotations;
using EduCore.API.Enums;

namespace EduCore.API.Models;

public class GradeLevel
{
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string Name { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }

    public EducationLevel EducationLevel { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<ProgramOffering> ProgramOfferings { get; set; }
        = new List<ProgramOffering>();
}