using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.PaymentNumber).IsUnique();

        builder.Property(x => x.Status)
               .HasConversion<string>();

        builder.Property(x => x.PaymentMethod)
               .HasConversion<string>();

        builder.HasQueryFilter(x => !x.IsDeleted);

        builder.HasOne(x => x.StudentBill)
               .WithMany(x => x.Payments)
               .HasForeignKey(x => x.StudentBillId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.ProcessedBy)
               .WithMany()
               .HasForeignKey(x => x.ProcessedByEmployeeId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ProcessedByUser)
               .WithMany()
               .HasForeignKey(x => x.ProcessedByUserId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
