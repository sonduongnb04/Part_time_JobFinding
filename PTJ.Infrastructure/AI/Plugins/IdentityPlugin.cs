using System.ComponentModel;
using Microsoft.SemanticKernel;
using PTJ.Application.Services;

namespace PTJ.Infrastructure.AI.Plugins;

public class IdentityPlugin
{
    private readonly ICompanyService _companyService;
    private readonly IJobPostService _jobService; // Optional: If we want to check job ownership later

    public IdentityPlugin(ICompanyService companyService, IJobPostService jobService)
    {
        _companyService = companyService;
        _jobService = jobService;
    }

    [KernelFunction("check_my_company_status")]
    [Description("Checks if the current user has registered a company and its approval status.")]
    [return: Description("The status of the user's company (e.g., Active, Pending, None).")]
    public async Task<string> CheckMyCompanyStatusAsync(
        [Description("The ID of the current user.")] int userId
    )
    {
        var result = await _companyService.GetByUserIdAsync(userId);
        
        if (!result.Success || result.Data == null)
        {
            return "You have not registered any company yet.";
        }

        var company = result.Data;
        var status = company.IsVerified ? "Verified/Active" : "Pending Approval";
        
        return $"You have a company named '{company.Name}'. Status: {status}.";
    }
}
