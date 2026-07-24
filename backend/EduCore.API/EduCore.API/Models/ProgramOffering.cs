namespace EduCore.API.Models;

public class ProgramOffering
{
    public int Id { get; set; }

    public int AcademicYearId { get; set; }
    public AcademicYear AcademicYear { get; set; } = null!;

    public int GradeLevelId { get; set; }
    public GradeLevel GradeLevel { get; set; } = null!;

    // Nullable for Junior High
    public int? ProgramId { get; set; }
    public AcademicProgram? Program { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Section> Sections { get; set; }
        = new List<Section>();
}