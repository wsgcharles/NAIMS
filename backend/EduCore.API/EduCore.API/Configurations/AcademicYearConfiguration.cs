using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class AcademicYearConfiguration : IEntityTypeConfiguration<AcademicYear>
{
    public void Configure(EntityTypeBuilder<AcademicYear> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.SchoolYear)
               .IsUnique();

        builder.Property(x => x.Status)
               .HasConversion<string>();

        builder.HasMany(x => x.ProgramOfferings)
               .WithOne(x => x.AcademicYear)
               .HasForeignKey(x => x.AcademicYearId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}