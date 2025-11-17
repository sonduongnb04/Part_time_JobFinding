using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PTJ.Application.Common;
using PTJ.Application.DTOs.JobPost;
using PTJ.Application.Services;
using PTJ.Domain.Enums;

namespace PTJ.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobPostsController : ControllerBase
{
    private readonly IJobPostService _jobPostService;

    public JobPostsController(IJobPostService jobPostService)
    {
        _jobPostService = jobPostService;
    }

    /// <summary>
    /// Get job post by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _jobPostService.GetByIdAsync(id, cancellationToken);

        if (!result.Success)
        {
            return NotFound(result);
        }

        // Increment view count
        await _jobPostService.IncrementViewCountAsync(id, cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Get all active job posts with pagination
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var result = await _jobPostService.GetAllAsync(pageNumber, pageSize, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Search job posts
    /// </summary>
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] SearchParameters parameters, CancellationToken cancellationToken)
    {
        var result = await _jobPostService.SearchAsync(parameters, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get job posts by company ID
    /// </summary>
    [HttpGet("company/{companyId}")]
    public async Task<IActionResult> GetByCompanyId(int companyId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var result = await _jobPostService.GetByCompanyIdAsync(companyId, pageNumber, pageSize, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Create a new job post (Employer only)
    /// </summary>
    [Authorize(Roles = "EMPLOYER,ADMIN")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJobPostDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _jobPostService.CreateAsync(userId, dto, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
    }

    /// <summary>
    /// Update job post (Employer only)
    /// </summary>
    [Authorize(Roles = "EMPLOYER,ADMIN")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateJobPostDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _jobPostService.UpdateAsync(id, userId, dto, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Delete job post (Employer only)
    /// </summary>
    [Authorize(Roles = "EMPLOYER,ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _jobPostService.DeleteAsync(id, userId, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Change job post status (Employer only)
    /// </summary>
    [Authorize(Roles = "EMPLOYER,ADMIN")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] JobPostStatus status, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _jobPostService.ChangeStatusAsync(id, userId, status, cancellationToken);

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
