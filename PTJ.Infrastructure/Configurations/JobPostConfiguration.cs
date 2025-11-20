using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class JobPostConfiguration : IEntityTypeConfiguration<JobPost>
{
    public void Configure(EntityTypeBuilder<JobPost> builder)
    {
        builder.ToTable("JobPosts", "jobs");

        builder.HasKey(jp => jp.Id);

        builder.Property(jp => jp.Title)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(jp => jp.Description)
            .IsRequired()
            .HasMaxLength(5000);

        builder.Property(jp => jp.Requirements)
            .HasMaxLength(3000);

        builder.Property(jp => jp.Benefits)
            .HasMaxLength(3000);

        builder.Property(jp => jp.SalaryMin)
            .HasPrecision(12, 2);

        builder.Property(jp => jp.SalaryMax)
            .HasPrecision(12, 2);

        builder.Property(jp => jp.SalaryPeriod)
            .HasMaxLength(20);

        builder.Property(jp => jp.Location)
            .HasMaxLength(255);

        builder.Property(jp => jp.WorkType)
            .HasMaxLength(50);

        builder.Property(jp => jp.Category)
            .HasMaxLength(100);

        builder.HasIndex(jp => jp.CompanyId);
        builder.HasIndex(jp => jp.Status);
        builder.HasIndex(jp => jp.CreatedAt);

        builder.HasOne(jp => jp.Company)
            .WithMany(c => c.JobPosts)
            .HasForeignKey(jp => jp.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(jp => !jp.IsDeleted);
    }
}
