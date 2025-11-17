using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class ApplicationStatusLookupConfiguration : IEntityTypeConfiguration<ApplicationStatusLookup>
{
    public void Configure(EntityTypeBuilder<ApplicationStatusLookup> builder)
    {
        builder.ToTable("ApplicationStatuses", "jobs");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.Description)
            .HasMaxLength(255);

        builder.HasIndex(s => s.Name)
            .IsUnique();

        builder.HasQueryFilter(s => !s.IsDeleted);

        // Seed data
        builder.HasData(
            new ApplicationStatusLookup { Id = 1, Name = "Pending", Description = "Application submitted", DisplayOrder = 1, CreatedAt = DateTime.UtcNow, IsDeleted = false, RowVersion = new byte[] { 0 } },
            new ApplicationStatusLookup { Id = 2, Name = "Reviewing", Description = "Under review", DisplayOrder = 2, CreatedAt = DateTime.UtcNow, IsDeleted = false, RowVersion = new byte[] { 0 } },
            new ApplicationStatusLookup { Id = 3, Name = "Shortlisted", Description = "Shortlisted for interview", DisplayOrder = 3, CreatedAt = DateTime.UtcNow, IsDeleted = false, RowVersion = new byte[] { 0 } },
            new ApplicationStatusLookup { Id = 4, Name = "Interviewing", Description = "Interview scheduled", DisplayOrder = 4, CreatedAt = DateTime.UtcNow, IsDeleted = false, RowVersion = new byte[] { 0 } },
            new ApplicationStatusLookup { Id = 5, Name = "Offered", Description = "Job offer made", DisplayOrder = 5, CreatedAt = DateTime.UtcNow, IsDeleted = false, RowVersion = new byte[] { 0 } },
            new ApplicationStatusLookup { Id = 6, Name = "Accepted", Description = "Offer accepted", DisplayOrder = 6, CreatedAt = DateTime.UtcNow, IsDeleted = false, RowVersion = new byte[] { 0 } },
            new ApplicationStatusLookup { Id = 7, Name = "Rejected", Description = "Application rejected", DisplayOrder = 7, CreatedAt = DateTime.UtcNow, IsDeleted = false, RowVersion = new byte[] { 0 } },
            new ApplicationStatusLookup { Id = 8, Name = "Withdrawn", Description = "Application withdrawn", DisplayOrder = 8, CreatedAt = DateTime.UtcNow, IsDeleted = false, RowVersion = new byte[] { 0 } },
            new ApplicationStatusLookup { Id = 9, Name = "Expired", Description = "Application expired", DisplayOrder = 9, CreatedAt = DateTime.UtcNow, IsDeleted = false, RowVersion = new byte[] { 0 } }
        );
    }
}
