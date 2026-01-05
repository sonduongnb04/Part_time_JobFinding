using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PTJ.Application.Common;
using PTJ.Application.Services;
using PTJ.Domain.Enums;

namespace PTJ.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpPost("users/{id}/lock")]
    public async Task<ActionResult<Result>> LockUser(int id)
    {
        var result = await _adminService.LockUserAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("users/{id}/unlock")]
    public async Task<ActionResult<Result>> UnlockUser(int id)
    {
        var result = await _adminService.UnlockUserAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<ActionResult<Result<PaginatedList<object>>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _adminService.GetUsersAsync(search, pageNumber, pageSize);
        return Ok(result);
    }

    [HttpPut("jobs/{id}/status")]
    public async Task<ActionResult<Result>> UpdateJobStatus(int id, [FromBody] UpdateJobStatusRequest request)
    {
        var result = await _adminService.UpdateJobPostStatusAsync(id, request.Status);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("jobs")]
    public async Task<ActionResult<Result<PaginatedList<object>>>> GetJobs(
        [FromQuery] string? search,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _adminService.GetJobsAsync(search, pageNumber, pageSize);
        return Ok(result);
    }

    [HttpDelete("jobs/{id}")]
    public async Task<ActionResult<Result>> DeleteJob(int id)
    {
        var result = await _adminService.DeleteJobPostAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<Result<object>>> GetDashboardStats()
    {
        return Ok(await _adminService.GetDashboardStatsAsync());
    }
}

public class UpdateJobStatusRequest
{
    public JobPostStatus Status { get; set; }
}
