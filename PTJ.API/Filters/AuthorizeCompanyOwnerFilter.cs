using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PTJ.Application.Common;
using PTJ.Domain.Interfaces;

namespace PTJ.API.Filters;

/// <summary>
/// Filter to ensure user owns the company they're trying to access/modify
/// </summary>
public class AuthorizeCompanyOwnerFilter : IAsyncActionFilter
{
    private readonly IUnitOfWork _unitOfWork;

    public AuthorizeCompanyOwnerFilter(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            context.Result = new UnauthorizedObjectResult(Result<object>.FailureResult("Unauthorized"));
            return;
        }

        // Try to get companyId from route
        if (!context.RouteData.Values.TryGetValue("id", out var companyIdObj) ||
            !int.TryParse(companyIdObj?.ToString(), out var companyId))
        {
            await next();
            return;
        }

        var company = await _unitOfWork.Companies.GetByIdAsync(companyId);
        if (company == null)
        {
            context.Result = new NotFoundObjectResult(Result<object>.FailureResult("Company not found"));
            return;
        }

        if (company.OwnerId != userId)
        {
            context.Result = new ForbidResult();
            return;
        }

        await next();
    }
}
