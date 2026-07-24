using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class StudentSectionAssignmentConfiguration : IEntityTypeConfiguration<StudentSectionAssignment>
{
    public void Configure(EntityTypeBuilder<StudentSectionAssignment> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => new
        {
            x.StudentId,
            x.SectionId
        }).IsUnique();

        builder.HasOne(x => x.Student)
               .WithMany(x => x.SectionAssignments)
               .HasForeignKey(x => x.StudentId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Section)
               .WithMany(x => x.StudentAssignments)
               .HasForeignKey(x => x.SectionId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}