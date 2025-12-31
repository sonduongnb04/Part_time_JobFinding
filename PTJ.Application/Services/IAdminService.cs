using PTJ.Application.Common;
using PTJ.Domain.Enums;

namespace PTJ.Application.Services;

public interface IAdminService
{
    // User Management
    Task<Result> LockUserAsync(int userId);
    Task<Result> UnlockUserAsync(int userId);
    Task<Result<PaginatedList<object>>> GetUsersAsync(string? search, int pageNumber, int pageSize);

    // Job Management (Admin override)
    Task<Result> UpdateJobPostStatusAsync(int id, JobPostStatus status);
    Task<Result> DeleteJobPostAsync(int id);

    // Report/Stats
    Task<Result<object>> GetDashboardStatsAsync();
}
