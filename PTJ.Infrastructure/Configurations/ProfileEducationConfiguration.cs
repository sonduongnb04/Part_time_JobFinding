using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class ProfileEducationConfiguration : IEntityTypeConfiguration<ProfileEducation>
{
    public void Configure(EntityTypeBuilder<ProfileEducation> builder)
    {
        builder.ToTable("ProfileEducations", "seeker");

        builder.HasKey(pe => pe.Id);

        builder.Property(pe => pe.InstitutionName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(pe => pe.Degree)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(pe => pe.FieldOfStudy)
            .HasMaxLength(100);

        builder.Property(pe => pe.GPA)
            .HasPrecision(3, 2);

        builder.Property(pe => pe.Description)
            .HasMaxLength(1000);

        builder.HasIndex(pe => pe.ProfileId);

        builder.HasOne(pe => pe.Profile)
            .WithMany(p => p.Educations)
            .HasForeignKey(pe => pe.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

