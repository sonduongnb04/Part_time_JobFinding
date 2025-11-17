using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PTJ.Application.Common;

namespace PTJ.API.Filters;

/// <summary>
/// Filter for automatic model validation
/// </summary>
public class ValidationFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            var errors = context.ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors.Select(e => e.ErrorMessage))
                .ToList();

            var errorMessage = string.Join("; ", errors);

            var response = Result<object>.FailureResult(errorMessage);
            context.Result = new BadRequestObjectResult(response);
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        // No action needed after execution
    }
}
