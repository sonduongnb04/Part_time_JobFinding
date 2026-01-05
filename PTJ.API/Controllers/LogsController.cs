using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PTJ.Application.Common;
using PTJ.Application.Services;

namespace PTJ.API.Controllers;

/// <summary>
/// Controller for viewing activity and error logs (Admin only)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class LogsController : ControllerBase
{
    private readonly IActivityLogService _activityLogService;
    private readonly IErrorLogService _errorLogService;
    private readonly ILogger<LogsController> _logger;

    public LogsController(
        IActivityLogService activityLogService,
        IErrorLogService errorLogService,
        ILogger<LogsController> logger)
    {
        _activityLogService = activityLogService;
        _errorLogService = errorLogService;
        _logger = logger;
    }

    /// <summary>
    /// Get user activity logs with filtering and pagination
    /// </summary>
    [HttpGet("activities")]
    public async Task<ActionResult<Result<object>>> GetActivityLogs(
        [FromQuery] int? userId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            if (pageSize > 100)
                pageSize = 100; // Limit max page size

            var (logs, totalCount) = await _activityLogService.GetActivityLogsAsync(
                userId, startDate, endDate, pageNumber, pageSize);

            // Map logs to format expected by frontend
            var items = logs.Select(l => new
            {
                l.Id,
                CreatedAt = l.Timestamp,
                UserName = l.User != null ? (l.User.FullName ?? l.User.Email) : (l.UserId.HasValue ? $"User #{l.UserId}" : "Guest"),
                l.UserId,
                Action = MapHttpMethodToAction(l.HttpMethod, l.Path),
                EntityType = MapPathToEntityType(l.Path),
                EntityId = ExtractEntityId(l.Path),
                Details = !string.IsNullOrEmpty(l.AdditionalData) ? l.AdditionalData : $"{l.HttpMethod} {l.Path}",
                l.StatusCode,
                l.DurationMs
            }).ToList();

            var result = new
            {
                items,
                totalCount,
                pageNumber,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return Ok(Result<object>.SuccessResult(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve activity logs");
            return StatusCode(500, Result<object>.FailureResult("Failed to retrieve activity logs"));
        }
    }

    /// <summary>
    /// Get system error logs with filtering and pagination
    /// </summary>
    [HttpGet("errors")]
    public async Task<ActionResult<Result<object>>> GetErrorLogs(
        [FromQuery] string? level = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            if (pageSize > 100)
                pageSize = 100; // Limit max page size

            var (logs, totalCount) = await _errorLogService.GetErrorLogsAsync(
                level, startDate, endDate, pageNumber, pageSize);

            var result = new
            {
                logs,
                totalCount,
                pageNumber,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return Ok(Result<object>.SuccessResult(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve error logs");
            return StatusCode(500, Result<object>.FailureResult("Failed to retrieve error logs"));
        }
    }

    /// <summary>
    /// Get statistics about activity logs
    /// </summary>
    [HttpGet("activities/stats")]
    public async Task<ActionResult<Result<object>>> GetActivityStats(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var (logs, _) = await _activityLogService.GetActivityLogsAsync(
                null, startDate, endDate, 1, int.MaxValue);

            var stats = new
            {
                totalRequests = logs.Count,
                successfulRequests = logs.Count(l => l.StatusCode >= 200 && l.StatusCode < 300),
                failedRequests = logs.Count(l => l.StatusCode >= 400),
                uniqueUsers = logs.Where(l => l.UserId.HasValue).Select(l => l.UserId).Distinct().Count(),
                anonymousRequests = logs.Count(l => !l.UserId.HasValue),
                averageDurationMs = logs.Any() ? logs.Average(l => l.DurationMs) : 0,
                topPaths = logs
                    .GroupBy(l => l.Path)
                    .OrderByDescending(g => g.Count())
                    .Take(10)
                    .Select(g => new { path = g.Key, count = g.Count() })
                    .ToList()
            };

            return Ok(Result<object>.SuccessResult(stats));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve activity statistics");
            return StatusCode(500, Result<object>.FailureResult("Failed to retrieve activity statistics"));
        }
    }

    /// <summary>
    /// Get statistics about error logs
    /// </summary>
    [HttpGet("errors/stats")]
    public async Task<ActionResult<Result<object>>> GetErrorStats(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var (logs, _) = await _errorLogService.GetErrorLogsAsync(
                null, startDate, endDate, 1, int.MaxValue);

            var stats = new
            {
                totalErrors = logs.Count,
                criticalErrors = logs.Count(l => l.Level == "Critical"),
                errors = logs.Count(l => l.Level == "Error"),
                warnings = logs.Count(l => l.Level == "Warning"),
                errorsByType = logs
                    .Where(l => l.ExceptionType != null)
                    .GroupBy(l => l.ExceptionType)
                    .OrderByDescending(g => g.Count())
                    .Take(10)
                    .Select(g => new { exceptionType = g.Key, count = g.Count() })
                    .ToList(),
                errorsByPath = logs
                    .Where(l => l.RequestPath != null)
                    .GroupBy(l => l.RequestPath)
                    .OrderByDescending(g => g.Count())
                    .Take(10)
                    .Select(g => new { path = g.Key, count = g.Count() })
                    .ToList()
            };

            return Ok(Result<object>.SuccessResult(stats));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve error statistics");
            return StatusCode(500, Result<object>.FailureResult("Failed to retrieve error statistics"));
        }
    }
    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private string MapHttpMethodToAction(string method, string path)
    {
        if (string.IsNullOrEmpty(method)) return "Unknown";
        
        path = path.ToLower();
        if (path.Contains("/login")) return "Login";
        if (path.Contains("/logout")) return "Logout";
        if (path.Contains("/approve")) return "Approve";
        if (path.Contains("/reject")) return "Reject";
        if (path.Contains("/lock")) return "Lock";
        if (path.Contains("/unlock")) return "Unlock";

        return method.ToUpper() switch
        {
            "POST" => "Create",
            "PUT" => "Update",
            "PATCH" => "Update",
            "DELETE" => "Delete",
            _ => "View"
        };
    }

    private string MapPathToEntityType(string path)
    {
        if (string.IsNullOrEmpty(path)) return "System";
        
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        // exclude 'api' prefix if exists
        var significantSegment = segments.FirstOrDefault(s => !s.Equals("api", StringComparison.OrdinalIgnoreCase));
        
        return significantSegment?.ToLower() switch
        {
            "auth" => "Auth",
            "jobposts" => "Job Post",
            "companies" => "Company",
            "companyrequests" => "Company Request",
            "profiles" => "Profile",
            "applications" => "Application",
            "admin" => "Admin",
            "users" => "User",
            "chat" => "Chat",
            _ => significantSegment ?? "System"
        };
    }

    private string? ExtractEntityId(string path)
    {
        if (string.IsNullOrEmpty(path)) return null;
        
        var segments = path.Split('/');
        // Try to find a numeric segment
        return segments.FirstOrDefault(s => int.TryParse(s, out _));
    }
}
