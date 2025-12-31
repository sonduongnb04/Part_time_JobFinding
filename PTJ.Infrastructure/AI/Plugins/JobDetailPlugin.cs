using System.ComponentModel;
using System.Text.Json;
using Microsoft.SemanticKernel;
using PTJ.Application.Services;

namespace PTJ.Infrastructure.AI.Plugins;

public class JobDetailPlugin
{
    private readonly IJobPostService _jobPostService;

    public JobDetailPlugin(IJobPostService jobPostService)
    {
        _jobPostService = jobPostService;
    }

    [KernelFunction("get_job_details")]
    [Description("Retrieves detailed information about a specific job post.")]
    [return: Description("A JSON string containing full job description, requirements, benefits, and salary.")]
    public async Task<string> GetJobDetailsAsync(
        [Description("The ID of the job post to retrieve.")] int jobId
    )
    {
        var result = await _jobPostService.GetByIdAsync(jobId);
        
        if (!result.Success || result.Data == null)
        {
            return "Job post not found.";
        }

        var job = result.Data;

        var simpleJobDto = new
        {
            job.Id,
            job.Title,
            job.CompanyName,
            job.Description,
            job.Requirements,
            job.Benefits,
            job.SalaryMin,
            job.SalaryMax,
            job.Location,
            job.WorkType,
            job.ApplicationDeadline,
            SkillsRequired = job.RequiredSkills
        };

        return JsonSerializer.Serialize(simpleJobDto);
    }
}
