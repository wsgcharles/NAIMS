using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.EnrollmentNumber)
               .IsUnique();

        builder.Property(x => x.EnrollmentType)
               .HasConversion<string>();

        builder.Property(x => x.Status)
               .HasConversion<string>();

        builder.HasOne(x => x.Student)
               .WithMany(x => x.Enrollments)
               .HasForeignKey(x => x.StudentId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Section)
               .WithMany()
               .HasForeignKey(x => x.SectionId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ApprovedBy)
               .WithMany()
               .HasForeignKey(x => x.ApprovedByEmployeeId)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(x => x.Grades)
               .WithOne(x => x.Enrollment)
               .HasForeignKey(x => x.EnrollmentId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}