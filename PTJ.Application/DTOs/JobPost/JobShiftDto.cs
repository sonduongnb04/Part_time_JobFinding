namespace PTJ.Application.DTOs.JobPost;

public class JobShiftDto
{
    public int Id { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Notes { get; set; }
}
