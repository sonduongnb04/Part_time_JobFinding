using PTJ.Domain.Enums;

namespace PTJ.Application.DTOs.JobPost;

public class JobPostDto
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? CompanyLogoUrl { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Requirements { get; set; }
    public string? Benefits { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? SalaryPeriod { get; set; }
    public string? Location { get; set; }
    public string? WorkType { get; set; }
    public string? Category { get; set; }
    public string? JobLevel { get; set; }
    public int? NumberOfPositions { get; set; }
    public DateTime? ApplicationDeadline { get; set; }
    public JobPostStatus Status { get; set; }
    public int ViewCount { get; set; }
    public int ApplicationCount { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsUrgent { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<JobShiftDto> Shifts { get; set; } = new();
    public List<string> RequiredSkills { get; set; } = new();
}
