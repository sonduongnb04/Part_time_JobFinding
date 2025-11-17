namespace PTJ.Application.DTOs.JobPost;

public class UpdateJobPostDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Requirements { get; set; }
    public string? Benefits { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? SalaryPeriod { get; set; }
    public string? Location { get; set; }
    public string? WorkType { get; set; }
    public string? Category { get; set; }
    public int? NumberOfPositions { get; set; }
    public DateTime? ApplicationDeadline { get; set; }
}
