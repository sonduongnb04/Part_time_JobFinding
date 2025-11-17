using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class JobPostSkillConfiguration : IEntityTypeConfiguration<JobPostSkill>
{
    public void Configure(EntityTypeBuilder<JobPostSkill> builder)
    {
        builder.ToTable("JobPostSkills", "jobs");

        builder.HasKey(jps => jps.Id);

        builder.Property(jps => jps.SkillName)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(jps => jps.JobPostId);

        builder.HasOne(jps => jps.JobPost)
            .WithMany(jp => jp.RequiredSkills)
            .HasForeignKey(jps => jps.JobPostId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

