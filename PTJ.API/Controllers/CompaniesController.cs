using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PTJ.Application.DTOs.Company;
using PTJ.Application.Services;

namespace PTJ.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyService _companyService;

    public CompaniesController(ICompanyService companyService)
    {
        _companyService = companyService;
    }

    /// <summary>
    /// Get company by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _companyService.GetByIdAsync(id, cancellationToken);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get all companies with pagination
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var result = await _companyService.GetAllAsync(pageNumber, pageSize, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get my company (authenticated user)
    /// </summary>
    [Authorize(Roles = "EMPLOYER,ADMIN")]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyCompany(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _companyService.GetByUserIdAsync(userId, cancellationToken);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Submit company registration request (Any authenticated user)
    /// </summary>
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCompanyDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _companyService.CreateAsync(userId, dto, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Update company (Employer only)
    /// </summary>
    [Authorize(Roles = "EMPLOYER,ADMIN")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateCompanyDto dto, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _companyService.UpdateAsync(id, userId, dto, cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Delete company (Employer only)
    /// </summary>
    [Authorize(Roles = "EMPLOYER,ADMIN")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _companyService.DeleteAsync(id, userId, cancellationToken);

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
