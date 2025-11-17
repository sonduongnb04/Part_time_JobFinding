using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class ProfileExperienceConfiguration : IEntityTypeConfiguration<ProfileExperience>
{
    public void Configure(EntityTypeBuilder<ProfileExperience> builder)
    {
        builder.ToTable("ProfileExperiences", "seeker");

        builder.HasKey(pe => pe.Id);

        builder.Property(pe => pe.CompanyName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(pe => pe.Position)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(pe => pe.Description)
            .HasMaxLength(2000);

        builder.HasIndex(pe => pe.ProfileId);

        builder.HasOne(pe => pe.Profile)
            .WithMany(p => p.Experiences)
            .HasForeignKey(pe => pe.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

