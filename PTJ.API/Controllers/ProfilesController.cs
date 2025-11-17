using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PTJ.Application.DTOs.Profile;
using PTJ.Application.Services;

namespace PTJ.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfilesController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfilesController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    /// <summary>
    /// Get profile by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _profileService.GetByIdAsync(id, cancellationToken);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get my profile (authenticated user)
    /// </summary>
    [Authorize(Roles = "STUDENT,ADMIN")]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _profileService.GetByUserIdAsync(userId, cancellationToken);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Create or update profile (Student only)
    /// </summary>
    [Authorize(Roles = "STUDENT,ADMIN")]
    [HttpPost]
    public async Task<IActionResult> CreateOrUpdate([FromBody] ProfileDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _profileService.CreateOrUpdateAsync(userId, dto, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Delete profile (Student only)
    /// </summary>
    [Authorize(Roles = "STUDENT,ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _profileService.DeleteAsync(id, userId, cancellationToken);

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
