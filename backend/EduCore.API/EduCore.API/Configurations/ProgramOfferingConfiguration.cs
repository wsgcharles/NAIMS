using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class ProgramOfferingConfiguration : IEntityTypeConfiguration<ProgramOffering>
{
    public void Configure(EntityTypeBuilder<ProgramOffering> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.AcademicYear)
               .WithMany(x => x.ProgramOfferings)
               .HasForeignKey(x => x.AcademicYearId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.GradeLevel)
               .WithMany(x => x.ProgramOfferings)
               .HasForeignKey(x => x.GradeLevelId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Program)
               .WithMany(x => x.ProgramOfferings)
               .HasForeignKey(x => x.ProgramId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Sections)
               .WithOne(x => x.ProgramOffering)
               .HasForeignKey(x => x.ProgramOfferingId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}