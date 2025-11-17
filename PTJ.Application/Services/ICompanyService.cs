using PTJ.Application.Common;
using PTJ.Application.DTOs.Company;

namespace PTJ.Application.Services;

public interface ICompanyService
{
    Task<Result<CompanyDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<CompanyDto>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<Result<PaginatedList<CompanyDto>>> GetAllAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<Result<CompanyRegistrationRequestDto>> CreateAsync(int userId, CreateCompanyDto dto, CancellationToken cancellationToken = default);
    Task<Result<CompanyDto>> UpdateAsync(int id, int userId, CreateCompanyDto dto, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(int id, int userId, CancellationToken cancellationToken = default);
    
    // Company Registration Requests
    Task<Result<PaginatedList<CompanyRegistrationRequestDto>>> GetPendingRequestsAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<Result<CompanyRegistrationRequestDto>> GetRequestByIdAsync(int requestId, CancellationToken cancellationToken = default);
    Task<Result<CompanyDto>> ApproveRequestAsync(int requestId, int adminUserId, CancellationToken cancellationToken = default);
    Task<Result> RejectRequestAsync(int requestId, int adminUserId, string rejectionReason, CancellationToken cancellationToken = default);
}
