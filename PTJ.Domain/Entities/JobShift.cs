using PTJ.Domain.Common;

namespace PTJ.Domain.Entities;

public class JobShift : BaseEntity
{
    public int JobPostId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public virtual JobPost JobPost { get; set; } = null!;
}
