using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class GradeConfiguration : IEntityTypeConfiguration<Grade>
{
    public void Configure(EntityTypeBuilder<Grade> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Enrollment)
               .WithMany(x => x.Grades)
               .HasForeignKey(x => x.EnrollmentId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Subject)
               .WithMany(x => x.Grades)
               .HasForeignKey(x => x.SubjectId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.TeachingAssignment)
               .WithMany(x => x.Grades)
               .HasForeignKey(x => x.TeachingAssignmentId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}