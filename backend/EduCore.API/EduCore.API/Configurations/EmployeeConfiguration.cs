using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.EmployeeNumber)
               .IsUnique();

        builder.HasOne(x => x.User)
               .WithOne(x => x.Employee)
               .HasForeignKey<Employee>(x => x.UserId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}