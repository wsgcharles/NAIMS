using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class SubjectConfiguration : IEntityTypeConfiguration<Subject>
{
    public void Configure(EntityTypeBuilder<Subject> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.SubjectCode)
               .IsUnique();

        builder.HasOne(x => x.GradeLevel)
               .WithMany()
               .HasForeignKey(x => x.GradeLevelId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.TeachingAssignments)
               .WithOne(x => x.Subject)
               .HasForeignKey(x => x.SubjectId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Grades)
               .WithOne(x => x.Subject)
               .HasForeignKey(x => x.SubjectId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}