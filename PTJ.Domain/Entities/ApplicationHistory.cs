using PTJ.Domain.Common;

namespace PTJ.Domain.Entities;

public class ApplicationHistory : BaseEntity
{
    public int ApplicationId { get; set; }
    public int FromStatusId { get; set; }
    public int ToStatusId { get; set; }
    public int? ChangedBy { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }

    // Navigation properties
    public virtual Application Application { get; set; } = null!;
    public virtual ApplicationStatusLookup FromStatus { get; set; } = null!;
    public virtual ApplicationStatusLookup ToStatus { get; set; } = null!;
    public virtual User? ChangedByUser { get; set; }
}
