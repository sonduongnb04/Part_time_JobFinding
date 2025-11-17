using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class JobShiftConfiguration : IEntityTypeConfiguration<JobShift>
{
    public void Configure(EntityTypeBuilder<JobShift> builder)
    {
        builder.ToTable("JobShifts", "jobs");

        builder.HasKey(js => js.Id);

        builder.Property(js => js.Notes)
            .HasMaxLength(500);

        builder.HasIndex(js => js.JobPostId);

        builder.HasOne(js => js.JobPost)
            .WithMany(jp => jp.Shifts)
            .HasForeignKey(js => js.JobPostId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

