using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class CompanyRegistrationRequestConfiguration : IEntityTypeConfiguration<CompanyRegistrationRequest>
{
    public void Configure(EntityTypeBuilder<CompanyRegistrationRequest> builder)
    {
        builder.ToTable("CompanyRegistrationRequests", "jobs");

        builder.HasKey(crr => crr.Id);

        builder.Property(crr => crr.CompanyName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(crr => crr.TaxCode)
            .HasMaxLength(50);

        builder.Property(crr => crr.Address)
            .HasMaxLength(500);

        builder.Property(crr => crr.Website)
            .HasMaxLength(255);

        builder.Property(crr => crr.Description)
            .HasMaxLength(2000);

        builder.Property(crr => crr.Industry)
            .HasMaxLength(100);

        builder.Property(crr => crr.RejectionReason)
            .HasMaxLength(1000);

        builder.HasIndex(crr => crr.RequesterId);
        builder.HasIndex(crr => crr.Status);

        builder.HasOne(crr => crr.Requester)
            .WithMany()
            .HasForeignKey(crr => crr.RequesterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(crr => crr.Reviewer)
            .WithMany()
            .HasForeignKey(crr => crr.ReviewedBy)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(crr => crr.ApprovedCompany)
            .WithMany()
            .HasForeignKey(crr => crr.ApprovedCompanyId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(crr => !crr.IsDeleted);
    }
}

