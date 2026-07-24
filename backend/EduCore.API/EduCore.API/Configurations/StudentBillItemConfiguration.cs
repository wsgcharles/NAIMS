using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class StudentBillItemConfiguration : IEntityTypeConfiguration<StudentBillItem>
{
    public void Configure(EntityTypeBuilder<StudentBillItem> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.StudentBill)
               .WithMany(x => x.BillItems)
               .HasForeignKey(x => x.StudentBillId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.SchoolFee)
               .WithMany()
               .HasForeignKey(x => x.SchoolFeeId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}
