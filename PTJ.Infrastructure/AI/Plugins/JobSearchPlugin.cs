using System.ComponentModel;
using System.Text.Json;
using Microsoft.SemanticKernel;
using PTJ.Application.Common;
using PTJ.Application.Services;

namespace PTJ.Infrastructure.AI.Plugins;

public class JobSearchPlugin
{
    private readonly IJobPostService _jobService;

    public JobSearchPlugin(IJobPostService jobService)
    {
        _jobService = jobService;
    }

    [KernelFunction("search_jobs")]
    [Description("Searches for job posts based on keywords.")]
    [return: Description("A list of job posts with details like title, company, salary, and location.")]
    public async Task<string> SearchJobsAsync(
        [Description("The keyword to search for job title or description.")] string keyword
    )
    {
        var parameters = new SearchParameters
        {
            SearchTerm = keyword,
            PageSize = 5 
        };
        
        var result = await _jobService.SearchAsync(parameters);
        
        if (!result.Success)
            return "Failed to search jobs.";

        var simpleJobs = result.Data.Items.Select(j => new 
        {
            j.Id,
            j.Title,
            j.CompanyName,
            j.Location,
            Salary = j.SalaryMin.HasValue ? $"{j.SalaryMin} - {j.SalaryMax}" : "Negotiable",
            j.WorkType
        });

        return JsonSerializer.Serialize(simpleJobs);
    }
}
