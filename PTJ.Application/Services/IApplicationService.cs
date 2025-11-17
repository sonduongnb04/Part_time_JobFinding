using PTJ.Application.Common;
using PTJ.Application.DTOs.Application;

namespace PTJ.Application.Services;

public interface IApplicationService
{
    Task<Result<ApplicationDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<PaginatedList<ApplicationDto>>> GetByJobPostIdAsync(int jobPostId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<Result<PaginatedList<ApplicationDto>>> GetByProfileIdAsync(int profileId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<Result<ApplicationDto>> CreateAsync(int userId, CreateApplicationDto dto, CancellationToken cancellationToken = default);
    Task<Result> UpdateStatusAsync(int id, int statusId, int userId, string? notes = null, CancellationToken cancellationToken = default);
    Task<Result> WithdrawAsync(int id, int userId, CancellationToken cancellationToken = default);
}
