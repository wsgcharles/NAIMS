using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class SchoolFeeConfiguration : IEntityTypeConfiguration<SchoolFee>
{
    public void Configure(EntityTypeBuilder<SchoolFee> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.FeeType)
               .HasConversion<string>();

        builder.HasQueryFilter(x => !x.IsDeleted);

        builder.HasOne(x => x.AcademicYear)
               .WithMany()
               .HasForeignKey(x => x.AcademicYearId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.GradeLevel)
               .WithMany()
               .HasForeignKey(x => x.GradeLevelId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
