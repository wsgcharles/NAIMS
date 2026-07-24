using EduCore.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCore.API.Configurations;

public class ParentConfiguration : IEntityTypeConfiguration<Parent>
{
    public void Configure(EntityTypeBuilder<Parent> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasOne(x => x.User)
               .WithOne(x => x.Parent)
               .HasForeignKey<Parent>(x => x.UserId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}