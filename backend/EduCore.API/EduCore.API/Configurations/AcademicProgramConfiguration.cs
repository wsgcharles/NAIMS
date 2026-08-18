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
            new AcademicProgram { Id = 1, Code = "ASSH", Name = "Arts, Social Sciences and Humanities", IsActive = true },
            new AcademicProgram { Id = 2, Code = "BE", Name = "Business Entrepreneurship", IsActive = true },
            new AcademicProgram { Id = 3, Code = "ICT-SUPP", Name = "ICT Support", IsActive = true },
            new AcademicProgram { Id = 4, Code = "HT", Name = "Hospitality and Tourism", IsActive = true },
            new AcademicProgram { Id = 5, Code = "ABM", Name = "Accountancy, Business and Management (ABM)", IsActive = true },
            new AcademicProgram { Id = 6, Code = "HUMSS201", Name = "HUMSS 201", IsActive = true },
            new AcademicProgram { Id = 7, Code = "GAS", Name = "General Academic Strand (GAS)", IsActive = true },
            new AcademicProgram { Id = 8, Code = "AD", Name = "Arts & Design (AD)", IsActive = true },
            new AcademicProgram { Id = 9, Code = "HE", Name = "Home Economics (HE)", IsActive = true },
            new AcademicProgram { Id = 10, Code = "ICT", Name = "Information and Communications Technology (ICT)", IsActive = true }
        );
    }
}