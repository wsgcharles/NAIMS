using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class SchoolSettingConfiguration : IEntityTypeConfiguration<SchoolSetting>
{
    public void Configure(EntityTypeBuilder<SchoolSetting> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.CurrentAcademicYear)
               .WithMany()
               .HasForeignKey(x => x.CurrentAcademicYearId)
               .OnDelete(DeleteBehavior.SetNull);

        builder.HasData(new SchoolSetting
        {
            Id = 1,
            SchoolName = "Noah's Academy Student Information System",
            OfficialReceiptPrefix = "OR-",
            StudentNumberPrefix = "STU-",
            BillNumberPrefix = "BILL-",
            PaymentNumberPrefix = "PAY-",
            Currency = "PHP",
            Address = "Main Campus, EduCore Plaza",
            ContactEmail = "info@noahsacademy.edu.ph",
            ContactPhone = "+63 (02) 8888-0000",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        });
    }
}
