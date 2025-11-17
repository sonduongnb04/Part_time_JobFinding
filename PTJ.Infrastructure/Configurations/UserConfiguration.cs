using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users", "auth");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(u => u.FullName)
            .HasMaxLength(255);

        builder.Property(u => u.PhoneNumber)
            .HasMaxLength(20);

        builder.Property(u => u.AvatarUrl)
            .HasMaxLength(500);

        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");

        builder.HasQueryFilter(u => !u.IsDeleted);

        // Relationships
        builder.HasOne(u => u.Profile)
            .WithOne(p => p.User)
            .HasForeignKey<Profile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(u => u.Company)
            .WithOne(c => c.Owner)
            .HasForeignKey<Company>(c => c.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
