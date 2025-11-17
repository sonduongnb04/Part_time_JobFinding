using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PTJ.Application.DTOs.Application;
using PTJ.Application.Services;

namespace PTJ.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _applicationService;

    public ApplicationsController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    /// <summary>
    /// Get application by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _applicationService.GetByIdAsync(id, cancellationToken);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get applications by job post ID (Employer only)
    /// </summary>
    [Authorize(Roles = "EMPLOYER,ADMIN")]
    [HttpGet("job/{jobPostId}")]
    public async Task<IActionResult> GetByJobPostId(int jobPostId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var result = await _applicationService.GetByJobPostIdAsync(jobPostId, pageNumber, pageSize, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get my applications (Student only)
    /// </summary>
    [Authorize(Roles = "STUDENT,ADMIN")]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyApplications([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();

        // Get user's profile first
        var profileResult = await GetProfileIdByUserIdAsync(userId, cancellationToken);
        if (profileResult == 0)
        {
            return BadRequest(new { Success = false, Message = "Profile not found" });
        }

        var result = await _applicationService.GetByProfileIdAsync(profileResult, pageNumber, pageSize, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Create application (Student only)
    /// </summary>
    [Authorize(Roles = "STUDENT,ADMIN")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateApplicationDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _applicationService.CreateAsync(userId, dto, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
    }

    /// <summary>
    /// Update application status (Employer only)
    /// </summary>
    [Authorize(Roles = "EMPLOYER,ADMIN")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateApplicationStatusDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _applicationService.UpdateStatusAsync(id, dto.StatusId, userId, dto.Notes, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Withdraw application (Student only)
    /// </summary>
    [Authorize(Roles = "STUDENT,ADMIN")]
    [HttpPost("{id}/withdraw")]
    public async Task<IActionResult> Withdraw(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _applicationService.WithdrawAsync(id, userId, cancellationToken);

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

    // Helper method - in real implementation, this should call ProfileService
    private async Task<int> GetProfileIdByUserIdAsync(int userId, CancellationToken cancellationToken)
    {
        // This is a placeholder - should be injected via IProfileService
        return 0;
    }

    public class UpdateApplicationStatusDto
    {
        public int StatusId { get; set; }
        public string? Notes { get; set; }
    }
}
