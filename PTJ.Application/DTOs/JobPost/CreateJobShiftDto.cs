namespace PTJ.Application.DTOs.JobPost;

public class CreateJobShiftDto
{
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Notes { get; set; }
}
