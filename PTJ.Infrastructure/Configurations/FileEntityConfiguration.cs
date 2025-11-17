using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Configurations;

public class FileEntityConfiguration : IEntityTypeConfiguration<FileEntity>
{
    public void Configure(EntityTypeBuilder<FileEntity> builder)
    {
        builder.ToTable("Files", "dbo");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(f => f.FileUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(f => f.FileType)
            .HasMaxLength(50);

        builder.Property(f => f.ContentType)
            .HasMaxLength(100);

        builder.Property(f => f.Checksum)
            .HasMaxLength(64);

        builder.HasIndex(f => f.UploadedBy);

        builder.HasOne(f => f.UploadedByUser)
            .WithMany()
            .HasForeignKey(f => f.UploadedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

