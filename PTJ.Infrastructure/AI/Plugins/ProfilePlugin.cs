using System.ComponentModel;
using System.Text.Json;
using Microsoft.SemanticKernel;
using PTJ.Application.Services;

namespace PTJ.Infrastructure.AI.Plugins;

public class ProfilePlugin
{
    private readonly IProfileService _profileService;

    public ProfilePlugin(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [KernelFunction("get_my_profile")]
    [Description("Retrieves the professional profile (CV) of the current user.")]
    [return: Description("A JSON string containing skills, education, experience, and other profile details.")]
    public async Task<string> GetMyProfileAsync(
        [Description("The ID of the current user.")] int userId
    )
    {
        var result = await _profileService.GetByUserIdAsync(userId);
        
        if (!result.Success || result.Data == null)
        {
            return "Profile not found. The user has not created a profile yet.";
        }

        var profile = result.Data;
        
        // Simplify the object to send to AI (avoid sending unnecessary internal IDs if possible)
        var simpleProfile = new
        {
            profile.FirstName,
            profile.LastName,
            profile.Major,
            profile.GPA,
            profile.University,
            Skills = profile.Skills.Select(s => s.SkillName),
            Experience = profile.Experiences.Select(e => new 
            { 
                e.CompanyName, 
                e.Position, 
                Duration = $"{(e.EndDate?.ToString("MM/yyyy") ?? "Present")} - {e.StartDate:MM/yyyy}" 
            }),
            Education = profile.Educations.Select(e => new 
            { 
                e.InstitutionName, 
                e.Degree, 
                e.FieldOfStudy 
            })
        };

        return JsonSerializer.Serialize(simpleProfile);
    }
}
