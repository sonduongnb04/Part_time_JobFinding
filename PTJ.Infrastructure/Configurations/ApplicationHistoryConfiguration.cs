using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class ApplicationHistoryConfiguration : IEntityTypeConfiguration<ApplicationHistory>
{
    public void Configure(EntityTypeBuilder<ApplicationHistory> builder)
    {
        builder.ToTable("ApplicationHistories", "jobs");

        builder.HasKey(ah => ah.Id);

        builder.Property(ah => ah.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(ah => ah.ApplicationId);

        builder.HasOne(ah => ah.Application)
            .WithMany(a => a.History)
            .HasForeignKey(ah => ah.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ah => ah.FromStatus)
            .WithMany()
            .HasForeignKey(ah => ah.FromStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ah => ah.ToStatus)
            .WithMany()
            .HasForeignKey(ah => ah.ToStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ah => ah.ChangedByUser)
            .WithMany()
            .HasForeignKey(ah => ah.ChangedBy)
            .OnDelete(DeleteBehavior.NoAction);
    }
}

