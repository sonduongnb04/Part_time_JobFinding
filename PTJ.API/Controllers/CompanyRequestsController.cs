using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PTJ.Application.DTOs.Company;
using PTJ.Application.Services;

namespace PTJ.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class CompanyRequestsController : ControllerBase
{
    private readonly ICompanyService _companyService;

    public CompanyRequestsController(ICompanyService companyService)
    {
        _companyService = companyService;
    }

    /// <summary>
    /// Get all pending company registration requests (ADMIN only)
    /// </summary>
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingRequests(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var result = await _companyService.GetPendingRequestsAsync(pageNumber, pageSize, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get company registration request by ID (ADMIN only)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetRequestById(int id, CancellationToken cancellationToken)
    {
        var result = await _companyService.GetRequestByIdAsync(id, cancellationToken);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Approve company registration request (ADMIN only)
    /// </summary>
    [HttpPost("approve")]
    public async Task<IActionResult> ApproveRequest(
        [FromBody] ApproveCompanyRequestDto dto,
        CancellationToken cancellationToken)
    {
        var adminUserId = GetUserId();
        var result = await _companyService.ApproveRequestAsync(dto.RequestId, adminUserId, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Reject company registration request (ADMIN only)
    /// </summary>
    [HttpPost("reject")]
    public async Task<IActionResult> RejectRequest(
        [FromBody] RejectCompanyRequestDto dto,
        CancellationToken cancellationToken)
    {
        var adminUserId = GetUserId();
        var result = await _companyService.RejectRequestAsync(dto.RequestId, adminUserId, dto.RejectionReason, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }
}

