using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles", "auth");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.Description)
            .HasMaxLength(255);

        builder.HasIndex(r => r.Name)
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");

        builder.HasQueryFilter(r => !r.IsDeleted);

        // Seed data
        builder.HasData(
            new Role { Id = 1, Name = "ADMIN", Description = "Administrator", CreatedAt = DateTime.UtcNow, IsDeleted = false, RowVersion = new byte[] { 0 } },
            new Role { Id = 2, Name = "EMPLOYER", Description = "Employer/Company", CreatedAt = DateTime.UtcNow, IsDeleted = false, RowVersion = new byte[] { 0 } },
            new Role { Id = 3, Name = "STUDENT", Description = "Student/Job Seeker", CreatedAt = DateTime.UtcNow, IsDeleted = false, RowVersion = new byte[] { 0 } }
        );
    }
}
