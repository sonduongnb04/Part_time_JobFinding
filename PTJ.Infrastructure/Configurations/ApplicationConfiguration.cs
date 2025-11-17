using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class ApplicationConfiguration : IEntityTypeConfiguration<Domain.Entities.Application>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.Application> builder)
    {
        builder.ToTable("Applications", "jobs");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.CoverLetter)
            .HasMaxLength(2000);

        builder.Property(a => a.ResumeUrl)
            .HasMaxLength(500);

        builder.Property(a => a.ReviewNotes)
            .HasMaxLength(1000);

        builder.HasIndex(a => a.JobPostId);
        builder.HasIndex(a => a.ProfileId);
        builder.HasIndex(a => new { a.JobPostId, a.ProfileId })
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");

        builder.HasOne(a => a.JobPost)
            .WithMany(jp => jp.Applications)
            .HasForeignKey(a => a.JobPostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Profile)
            .WithMany(p => p.Applications)
            .HasForeignKey(a => a.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Status)
            .WithMany(s => s.Applications)
            .HasForeignKey(a => a.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Reviewer)
            .WithMany()
            .HasForeignKey(a => a.ReviewedBy)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasQueryFilter(a => !a.IsDeleted);
    }
}
