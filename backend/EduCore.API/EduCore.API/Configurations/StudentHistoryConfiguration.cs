using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class StudentHistoryConfiguration : IEntityTypeConfiguration<StudentHistory>
{
    public void Configure(EntityTypeBuilder<StudentHistory> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Action)
               .HasMaxLength(100);

        builder.Property(x => x.Description)
               .HasMaxLength(500);

        builder.HasOne(x => x.Student)
               .WithMany(x => x.Histories)
               .HasForeignKey(x => x.StudentId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Employee)
               .WithMany()
               .HasForeignKey(x => x.EmployeeId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}