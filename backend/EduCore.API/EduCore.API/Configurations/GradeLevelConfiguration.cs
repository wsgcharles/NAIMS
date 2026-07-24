using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class GradeLevelConfiguration : IEntityTypeConfiguration<GradeLevel>
{
    public void Configure(EntityTypeBuilder<GradeLevel> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.Name)
               .IsUnique();

        builder.Property(x => x.EducationLevel)
               .HasConversion<string>();

        builder.HasMany(x => x.ProgramOfferings)
               .WithOne(x => x.GradeLevel)
               .HasForeignKey(x => x.GradeLevelId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new GradeLevel { Id = 1, Name = "Grade 1", DisplayOrder = 1, EducationLevel = Enums.EducationLevel.Elementary, IsActive = true },
            new GradeLevel { Id = 2, Name = "Grade 2", DisplayOrder = 2, EducationLevel = Enums.EducationLevel.Elementary, IsActive = true },
            new GradeLevel { Id = 3, Name = "Grade 3", DisplayOrder = 3, EducationLevel = Enums.EducationLevel.Elementary, IsActive = true },
            new GradeLevel { Id = 4, Name = "Grade 4", DisplayOrder = 4, EducationLevel = Enums.EducationLevel.Elementary, IsActive = true },
            new GradeLevel { Id = 5, Name = "Grade 5", DisplayOrder = 5, EducationLevel = Enums.EducationLevel.Elementary, IsActive = true },
            new GradeLevel { Id = 6, Name = "Grade 6", DisplayOrder = 6, EducationLevel = Enums.EducationLevel.Elementary, IsActive = true },
            new GradeLevel { Id = 7, Name = "Grade 7", DisplayOrder = 7, EducationLevel = Enums.EducationLevel.JuniorHighSchool, IsActive = true },
            new GradeLevel { Id = 8, Name = "Grade 8", DisplayOrder = 8, EducationLevel = Enums.EducationLevel.JuniorHighSchool, IsActive = true },
            new GradeLevel { Id = 9, Name = "Grade 9", DisplayOrder = 9, EducationLevel = Enums.EducationLevel.JuniorHighSchool, IsActive = true },
            new GradeLevel { Id = 10, Name = "Grade 10", DisplayOrder = 10, EducationLevel = Enums.EducationLevel.JuniorHighSchool, IsActive = true },
            new GradeLevel { Id = 11, Name = "Grade 11", DisplayOrder = 11, EducationLevel = Enums.EducationLevel.SeniorHighSchool, IsActive = true },
            new GradeLevel { Id = 12, Name = "Grade 12", DisplayOrder = 12, EducationLevel = Enums.EducationLevel.SeniorHighSchool, IsActive = true }
        );
    }
}