using PTJ.Domain.Common;
using PTJ.Domain.Enums;

namespace PTJ.Domain.Entities;

public class JobPost : BaseAuditableEntity
{
    public int CompanyId { get; set; }
    public int CreatedByUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public string? Benefits { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? SalaryPeriod { get; set; } // Hourly, Daily, Weekly, Monthly
    public string? Location { get; set; }
    public string? WorkType { get; set; } // Full-time, Part-time, Freelance, Internship
    public string? Category { get; set; }
    public int? NumberOfPositions { get; set; }
    public DateTime? ApplicationDeadline { get; set; }
    public JobPostStatus Status { get; set; } = JobPostStatus.Draft;
    public int ViewCount { get; set; }
    public int ApplicationCount { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsUrgent { get; set; }

    // Navigation properties
    public virtual Company Company { get; set; } = null!;
    public virtual ICollection<JobShift> Shifts { get; set; } = new List<JobShift>();
    public virtual ICollection<JobPostSkill> RequiredSkills { get; set; } = new List<JobPostSkill>();
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
}
