using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class ProfileCertificateConfiguration : IEntityTypeConfiguration<ProfileCertificate>
{
    public void Configure(EntityTypeBuilder<ProfileCertificate> builder)
    {
        builder.ToTable("ProfileCertificates", "seeker");

        builder.HasKey(pc => pc.Id);

        builder.Property(pc => pc.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(pc => pc.IssuingOrganization)
            .HasMaxLength(255);

        builder.Property(pc => pc.CredentialId)
            .HasMaxLength(100);

        builder.Property(pc => pc.CredentialUrl)
            .HasMaxLength(500);

        builder.Property(pc => pc.CertificateFileUrl)
            .HasMaxLength(500);

        builder.HasIndex(pc => pc.ProfileId);

        builder.HasOne(pc => pc.Profile)
            .WithMany(p => p.Certificates)
            .HasForeignKey(pc => pc.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

