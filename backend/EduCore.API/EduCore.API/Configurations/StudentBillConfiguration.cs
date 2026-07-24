using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class StudentBillConfiguration : IEntityTypeConfiguration<StudentBill>
{
    public void Configure(EntityTypeBuilder<StudentBill> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.BillNumber).IsUnique();

        builder.Property(x => x.Status)
               .HasConversion<string>();

        builder.HasQueryFilter(x => !x.IsDeleted);

        builder.HasOne(x => x.Enrollment)
               .WithMany()
               .HasForeignKey(x => x.EnrollmentId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.CreatedByUser)
               .WithMany()
               .HasForeignKey(x => x.CreatedByUserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
