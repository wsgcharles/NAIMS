using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class EmailLogConfiguration : IEntityTypeConfiguration<EmailLog>
{
    public void Configure(EntityTypeBuilder<EmailLog> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status)
               .HasConversion<string>();

        builder.HasIndex(x => x.RecipientEmail);
        builder.HasIndex(x => x.SentAt);
    }
}
