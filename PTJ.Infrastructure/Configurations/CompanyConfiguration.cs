using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("Companies", "org");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.Description)
            .HasMaxLength(2000);

        builder.Property(c => c.Address)
            .HasMaxLength(500);

        builder.Property(c => c.Website)
            .HasMaxLength(255);

        builder.Property(c => c.LogoUrl)
            .HasMaxLength(500);

        builder.Property(c => c.TaxCode)
            .HasMaxLength(50);

        builder.Property(c => c.Industry)
            .HasMaxLength(100);

        builder.HasIndex(c => c.TaxCode)
            .IsUnique()
            .HasFilter("[TaxCode] IS NOT NULL AND [IsDeleted] = 0");

        builder.HasIndex(c => c.OwnerId)
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");

        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}
