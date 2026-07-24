using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.StudentNumber)
               .IsUnique();

        builder.HasIndex(x => x.LRN)
               .IsUnique();

        builder.HasIndex(x => x.Email)
               .IsUnique();

        builder.HasOne(x => x.User)
               .WithOne(x => x.Student)
               .HasForeignKey<Student>(x => x.UserId)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.Parent)
               .WithMany(x => x.Students)
               .HasForeignKey(x => x.ParentId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}