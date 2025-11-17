using PTJ.Domain.Common;

namespace PTJ.Domain.Entities;

public class FileEntity : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string? FileType { get; set; }
    public long FileSize { get; set; }
    public string? ContentType { get; set; }
    public string? Checksum { get; set; }
    public int UploadedBy { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User UploadedByUser { get; set; } = null!;
}
