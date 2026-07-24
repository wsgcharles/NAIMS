using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class OfficialReceiptConfiguration : IEntityTypeConfiguration<OfficialReceipt>
{
    public void Configure(EntityTypeBuilder<OfficialReceipt> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.ReceiptNumber).IsUnique();

        builder.HasOne(x => x.Payment)
               .WithOne(x => x.OfficialReceipt)
               .HasForeignKey<OfficialReceipt>(x => x.PaymentId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.IssuedBy)
               .WithMany()
               .HasForeignKey(x => x.IssuedByEmployeeId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
