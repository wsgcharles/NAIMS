using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class SectionConfiguration : IEntityTypeConfiguration<Section>
{
    public void Configure(EntityTypeBuilder<Section> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => new
        {
            x.ProgramOfferingId,
            x.SectionName
        }).IsUnique();

        builder.HasOne(x => x.ProgramOffering)
               .WithMany(x => x.Sections)
               .HasForeignKey(x => x.ProgramOfferingId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Adviser)
               .WithMany(x => x.AdvisorySections)
               .HasForeignKey(x => x.AdviserEmployeeId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}