using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class AcademicProgramConfiguration : IEntityTypeConfiguration<AcademicProgram>
{
    public void Configure(EntityTypeBuilder<AcademicProgram> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.Code)
               .IsUnique();

        builder.HasMany(x => x.ProgramOfferings)
               .WithOne(x => x.Program)
               .HasForeignKey(x => x.ProgramId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new AcademicProgram { Id = 1, Code = "STEM", Name = "Science, Technology, Engineering, and Mathematics", IsActive = true },
            new AcademicProgram { Id = 2, Code = "ABM", Name = "Accountancy, Business, and Management", IsActive = true },
            new AcademicProgram { Id = 3, Code = "HUMSS", Name = "Humanities and Social Sciences", IsActive = true },
            new AcademicProgram { Id = 4, Code = "GAS", Name = "General Academic Strand", IsActive = true },
            new AcademicProgram { Id = 5, Code = "ICT", Name = "Information and Communications Technology", IsActive = true },
            new AcademicProgram { Id = 6, Code = "HE", Name = "Home Economics", IsActive = true }
        );
    }
}