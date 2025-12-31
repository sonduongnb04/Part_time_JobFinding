using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using PTJ.Application.Common;
using PTJ.Application.Services;
using PTJ.Infrastructure.AI.Plugins;

namespace PTJ.Infrastructure.Services;

public class AIChatService : IAIChatService
{
    private readonly Kernel _kernel;
    private readonly JobSearchPlugin _jobSearchPlugin;
    private readonly IdentityPlugin _identityPlugin;
    private readonly ProfilePlugin _profilePlugin;
    private readonly JobDetailPlugin _jobDetailPlugin;

    public AIChatService(
        Kernel kernel, 
        JobSearchPlugin jobSearchPlugin,
        IdentityPlugin identityPlugin,
        ProfilePlugin profilePlugin,
        JobDetailPlugin jobDetailPlugin)
    {
        _kernel = kernel;
        _jobSearchPlugin = jobSearchPlugin;
        _identityPlugin = identityPlugin;
        _profilePlugin = profilePlugin;
        _jobDetailPlugin = jobDetailPlugin;
    }

    public async Task<Result<string>> ChatAsync(int userId, string userMessage, CancellationToken cancellationToken = default)
    {
        // 1. Dynamic Plugin Registration (Role-based logic can be added here)
        // For now, everyone gets Job Search capability
        if (!_kernel.Plugins.Contains("JobSearch"))
        {
            _kernel.Plugins.AddFromObject(_jobSearchPlugin, "JobSearch");
        }
        if (!_kernel.Plugins.Contains("Identity"))
        {
            _kernel.Plugins.AddFromObject(_identityPlugin, "Identity");
        }
        if (!_kernel.Plugins.Contains("Profile"))
        {
            _kernel.Plugins.AddFromObject(_profilePlugin, "Profile");
        }
        if (!_kernel.Plugins.Contains("JobDetail"))
        {
            _kernel.Plugins.AddFromObject(_jobDetailPlugin, "JobDetail");
        }

        // Settings for the AI model
        var settings = new OpenAIPromptExecutionSettings()
        {
            ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions,
            Temperature = 0.7,
            TopP = 0.9,
        };

        try
        {
            // Invoke the kernel with the user message
            var arguments = new KernelArguments(settings);
            var result = await _kernel.InvokePromptAsync(userMessage, arguments, cancellationToken: cancellationToken);

            return Result<string>.SuccessResult(result.GetValue<string>() ?? "I didn't receive a response.");
        }
        catch (Exception ex)
        {
            // Log the error
            return Result<string>.FailureResult($"AI processing failed: {ex.Message}. Make sure Ollama is running at http://localhost:11434");
        }
    }
}
