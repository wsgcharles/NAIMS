using System.ComponentModel.DataAnnotations;

namespace EduCore.API.Models;

public class AcademicProgram
{
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public ICollection<ProgramOffering> ProgramOfferings { get; set; }
        = new List<ProgramOffering>();
}