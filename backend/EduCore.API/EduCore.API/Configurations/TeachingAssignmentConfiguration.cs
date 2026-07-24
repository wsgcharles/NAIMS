using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class TeachingAssignmentConfiguration : IEntityTypeConfiguration<TeachingAssignment>
{
    public void Configure(EntityTypeBuilder<TeachingAssignment> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.Employee)
               .WithMany(x => x.TeachingAssignments)
               .HasForeignKey(x => x.EmployeeId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Subject)
               .WithMany(x => x.TeachingAssignments)
               .HasForeignKey(x => x.SubjectId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Section)
               .WithMany(x => x.TeachingAssignments)
               .HasForeignKey(x => x.SectionId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Grades)
               .WithOne(x => x.TeachingAssignment)
               .HasForeignKey(x => x.TeachingAssignmentId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}