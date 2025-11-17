using PTJ.Domain.Common;

namespace PTJ.Domain.Entities;

public class ProfileExperience : BaseEntity
{
    public int ProfileId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrentlyWorking { get; set; }

    // Navigation properties
    public virtual Profile Profile { get; set; } = null!;
}
