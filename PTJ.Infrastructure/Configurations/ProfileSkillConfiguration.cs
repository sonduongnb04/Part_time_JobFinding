using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class ProfileSkillConfiguration : IEntityTypeConfiguration<ProfileSkill>
{
    public void Configure(EntityTypeBuilder<ProfileSkill> builder)
    {
        builder.ToTable("ProfileSkills", "seeker");

        builder.HasKey(ps => ps.Id);

        builder.Property(ps => ps.SkillName)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(ps => ps.ProfileId);

        builder.HasOne(ps => ps.Profile)
            .WithMany(p => p.Skills)
            .HasForeignKey(ps => ps.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

