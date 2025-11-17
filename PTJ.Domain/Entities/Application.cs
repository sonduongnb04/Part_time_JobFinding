using PTJ.Domain.Common;

namespace PTJ.Domain.Entities;

public class Application : BaseAuditableEntity
{
    public int JobPostId { get; set; }
    public int ProfileId { get; set; }
    public int StatusId { get; set; }
    public string? CoverLetter { get; set; }
    public string? ResumeUrl { get; set; }
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public int? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewNotes { get; set; }

    // Navigation properties
    public virtual JobPost JobPost { get; set; } = null!;
    public virtual Profile Profile { get; set; } = null!;
    public virtual ApplicationStatusLookup Status { get; set; } = null!;
    public virtual User? Reviewer { get; set; }
    public virtual ICollection<ApplicationHistory> History { get; set; } = new List<ApplicationHistory>();
}
