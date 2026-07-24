using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class EnrollmentApplicationConfiguration : IEntityTypeConfiguration<EnrollmentApplication>
{
    public void Configure(EntityTypeBuilder<EnrollmentApplication> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.ApplicationNumber)
               .IsUnique();

        builder.HasIndex(x => x.Email);

        builder.Property(x => x.Status)
               .HasConversion<string>();

        builder.Property(x => x.Gender)
               .HasConversion<string>();
    }
}