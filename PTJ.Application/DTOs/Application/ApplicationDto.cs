namespace PTJ.Application.DTOs.Application;

public class ApplicationDto
{
    public int Id { get; set; }
    public int JobPostId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public int ProfileId { get; set; }
    public string ApplicantName { get; set; } = string.Empty;
    public string StatusName { get; set; } = string.Empty;
    public string? CoverLetter { get; set; }
    public string? ResumeUrl { get; set; }
    public DateTime AppliedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewNotes { get; set; }
}
