using PTJ.Application.Common;
using PTJ.Application.DTOs.JobPost;
using PTJ.Domain.Enums;

namespace PTJ.Application.Services;

public interface IJobPostService
{
    Task<Result<JobPostDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<PaginatedList<JobPostDto>>> GetAllAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<Result<PaginatedList<JobPostDto>>> SearchAsync(SearchParameters parameters, CancellationToken cancellationToken = default);
    Task<Result<PaginatedList<JobPostDto>>> GetByCompanyIdAsync(int companyId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<Result<JobPostDto>> CreateAsync(int userId, CreateJobPostDto dto, CancellationToken cancellationToken = default);
    Task<Result<JobPostDto>> UpdateAsync(int id, int userId, UpdateJobPostDto dto, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(int id, int userId, CancellationToken cancellationToken = default);
    Task<Result> ChangeStatusAsync(int id, int userId, JobPostStatus status, CancellationToken cancellationToken = default);
    Task<Result> IncrementViewCountAsync(int id, CancellationToken cancellationToken = default);
}
