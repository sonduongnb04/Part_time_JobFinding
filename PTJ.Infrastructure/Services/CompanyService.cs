using PTJ.Application.Common;
using PTJ.Application.DTOs.Company;
using PTJ.Application.Services;
using PTJ.Domain.Entities;
using PTJ.Domain.Interfaces;

namespace PTJ.Infrastructure.Services;

public class CompanyService : ICompanyService
{
    private readonly IUnitOfWork _unitOfWork;

    public CompanyService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CompanyDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var company = await _unitOfWork.Companies.GetByIdAsync(id, cancellationToken);

        if (company == null)
        {
            return Result<CompanyDto>.FailureResult("Company not found");
        }

        var dto = MapToDto(company);
        return Result<CompanyDto>.SuccessResult(dto);
    }

    public async Task<Result<CompanyDto>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var company = await _unitOfWork.Companies.FirstOrDefaultAsync(
            c => c.OwnerId == userId,
            cancellationToken);

        if (company == null)
        {
            return Result<CompanyDto>.FailureResult("Company not found for this user");
        }

        var dto = MapToDto(company);
        return Result<CompanyDto>.SuccessResult(dto);
    }

    public async Task<Result<PaginatedList<CompanyDto>>> GetAllAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var allCompanies = await _unitOfWork.Companies.GetAllAsync(cancellationToken);

        var totalCount = allCompanies.Count();
        var items = allCompanies
            .OrderByDescending(c => c.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToDto)
            .ToList();

        var result = new PaginatedList<CompanyDto>(items, totalCount, pageNumber, pageSize);

        return Result<PaginatedList<CompanyDto>>.SuccessResult(result);
    }

    public async Task<Result<CompanyRegistrationRequestDto>> CreateAsync(int userId, CreateCompanyDto dto, CancellationToken cancellationToken = default)
    {
        // Check if user already has a company
        var existingCompany = await _unitOfWork.Companies.FirstOrDefaultAsync(
            c => c.OwnerId == userId,
            cancellationToken);

        if (existingCompany != null)
        {
            return Result<CompanyRegistrationRequestDto>.FailureResult("User already has a company");
        }

        // Check if user already has a pending request
        var existingRequest = await _unitOfWork.CompanyRegistrationRequests.FirstOrDefaultAsync(
            r => r.RequesterId == userId && r.Status == Domain.Enums.CompanyRequestStatus.Pending,
            cancellationToken);

        if (existingRequest != null)
        {
            return Result<CompanyRegistrationRequestDto>.FailureResult("You already have a pending company registration request");
        }

        // Get user info
        var user = await _unitOfWork.Users.GetByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            return Result<CompanyRegistrationRequestDto>.FailureResult("User not found");
        }

        // Create registration request
        var request = new CompanyRegistrationRequest
        {
            RequesterId = userId,
            CompanyName = dto.Name,
            Description = dto.Description,
            Address = dto.Address,
            Website = dto.Website,
            TaxCode = dto.TaxCode,
            Industry = dto.Industry,
            EmployeeCount = dto.EmployeeCount,
            FoundedYear = dto.FoundedYear,
            Status = Domain.Enums.CompanyRequestStatus.Pending
            // CreatedAt will be set automatically by AppDbContext.SaveChangesAsync
        };

        await _unitOfWork.CompanyRegistrationRequests.AddAsync(request, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var result = new CompanyRegistrationRequestDto
        {
            Id = request.Id,
            RequesterId = request.RequesterId,
            RequesterEmail = user.Email,
            RequesterName = user.FullName ?? user.Email,
            CompanyName = request.CompanyName,
            TaxCode = request.TaxCode,
            Address = request.Address,
            Website = request.Website,
            Description = request.Description,
            Status = request.Status.ToString(),
            CreatedAt = request.CreatedAt
        };

        return Result<CompanyRegistrationRequestDto>.SuccessResult(result, "Company registration request submitted successfully. Please wait for admin approval.");
    }

    public async Task<Result<CompanyDto>> UpdateAsync(int id, int userId, CreateCompanyDto dto, CancellationToken cancellationToken = default)
    {
        var company = await _unitOfWork.Companies.GetByIdAsync(id, cancellationToken);

        if (company == null)
        {
            return Result<CompanyDto>.FailureResult("Company not found");
        }

        // Check ownership
        if (company.OwnerId != userId)
        {
            return Result<CompanyDto>.FailureResult("You don't have permission to update this company");
        }

        // Check if tax code already exists (for other companies)
        if (!string.IsNullOrEmpty(dto.TaxCode) && dto.TaxCode != company.TaxCode)
        {
            var companyWithTaxCode = await _unitOfWork.Companies.FirstOrDefaultAsync(
                c => c.TaxCode == dto.TaxCode && c.Id != id,
                cancellationToken);

            if (companyWithTaxCode != null)
            {
                return Result<CompanyDto>.FailureResult("Tax code already exists");
            }
        }

        // Update fields
        company.Name = dto.Name;
        company.Description = dto.Description;
        company.Address = dto.Address;
        company.Website = dto.Website;
        company.TaxCode = dto.TaxCode;
        company.Industry = dto.Industry;
        company.EmployeeCount = dto.EmployeeCount;
        company.FoundedYear = dto.FoundedYear;
        // UpdatedAt will be set automatically by AppDbContext.SaveChangesAsync

        _unitOfWork.Companies.Update(company);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var responseDto = MapToDto(company);

        return Result<CompanyDto>.SuccessResult(responseDto, "Company updated successfully");
    }

    public async Task<Result> DeleteAsync(int id, int userId, CancellationToken cancellationToken = default)
    {
        var company = await _unitOfWork.Companies.GetByIdAsync(id, cancellationToken);

        if (company == null)
        {
            return Result.FailureResult("Company not found");
        }

        // Check ownership
        if (company.OwnerId != userId)
        {
            return Result.FailureResult("You don't have permission to delete this company");
        }

        // Check if company has job posts
        var jobPosts = await _unitOfWork.JobPosts.FindAsync(jp => jp.CompanyId == id, cancellationToken);
        if (jobPosts.Any())
        {
            return Result.FailureResult("Cannot delete company with existing job posts");
        }

        _unitOfWork.Companies.Remove(company);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Company deleted successfully");
    }

    public async Task<Result<PaginatedList<CompanyRegistrationRequestDto>>> GetPendingRequestsAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var allRequests = await _unitOfWork.CompanyRegistrationRequests.FindAsync(
            r => r.Status == Domain.Enums.CompanyRequestStatus.Pending,
            cancellationToken);

        var totalCount = allRequests.Count();
        var items = new List<CompanyRegistrationRequestDto>();

        var pagedRequests = allRequests
            .OrderBy(r => r.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize);

        foreach (var request in pagedRequests)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(request.RequesterId, cancellationToken);
            items.Add(MapToRequestDto(request, user));
        }

        var result = new PaginatedList<CompanyRegistrationRequestDto>(items, totalCount, pageNumber, pageSize);
        return Result<PaginatedList<CompanyRegistrationRequestDto>>.SuccessResult(result);
    }

    public async Task<Result<CompanyRegistrationRequestDto>> GetRequestByIdAsync(int requestId, CancellationToken cancellationToken = default)
    {
        var request = await _unitOfWork.CompanyRegistrationRequests.GetByIdAsync(requestId, cancellationToken);
        
        if (request == null)
        {
            return Result<CompanyRegistrationRequestDto>.FailureResult("Registration request not found");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(request.RequesterId, cancellationToken);
        var reviewer = request.ReviewedBy.HasValue 
            ? await _unitOfWork.Users.GetByIdAsync(request.ReviewedBy.Value, cancellationToken)
            : null;

        var dto = MapToRequestDto(request, user, reviewer);
        return Result<CompanyRegistrationRequestDto>.SuccessResult(dto);
    }

    public async Task<Result<CompanyDto>> ApproveRequestAsync(int requestId, int adminUserId, CancellationToken cancellationToken = default)
    {
        var request = await _unitOfWork.CompanyRegistrationRequests.GetByIdAsync(requestId, cancellationToken);
        
        if (request == null)
        {
            return Result<CompanyDto>.FailureResult("Registration request not found");
        }

        if (request.Status != Domain.Enums.CompanyRequestStatus.Pending)
        {
            return Result<CompanyDto>.FailureResult($"Request has already been {request.Status.ToString().ToLower()}");
        }

        // Check if user already has a company
        var existingCompany = await _unitOfWork.Companies.FirstOrDefaultAsync(
            c => c.OwnerId == request.RequesterId,
            cancellationToken);

        if (existingCompany != null)
        {
            return Result<CompanyDto>.FailureResult("User already has a company");
        }

        // Check tax code uniqueness
        if (!string.IsNullOrEmpty(request.TaxCode))
        {
            var companyWithTaxCode = await _unitOfWork.Companies.FirstOrDefaultAsync(
                c => c.TaxCode == request.TaxCode,
                cancellationToken);

            if (companyWithTaxCode != null)
            {
                return Result<CompanyDto>.FailureResult("Tax code already exists");
            }
        }

        // Create company
        var company = new Company
        {
            OwnerId = request.RequesterId,
            Name = request.CompanyName,
            Description = request.Description,
            Address = request.Address,
            Website = request.Website,
            TaxCode = request.TaxCode,
            Industry = request.Industry,
            EmployeeCount = request.EmployeeCount,
            FoundedYear = request.FoundedYear,
            IsVerified = true
            // CreatedAt will be set automatically by AppDbContext.SaveChangesAsync
        };

        await _unitOfWork.Companies.AddAsync(company, cancellationToken);

        // Save company first to get the generated Id
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Update request status with the newly created company Id
        request.Status = Domain.Enums.CompanyRequestStatus.Approved;
        request.ReviewedBy = adminUserId;
        request.ReviewedAt = DateTime.UtcNow;
        request.ApprovedCompanyId = company.Id;
        _unitOfWork.CompanyRegistrationRequests.Update(request);

        // Assign EMPLOYER role to user
        var employerRole = await _unitOfWork.Roles.FirstOrDefaultAsync(
            r => r.Name == "EMPLOYER",
            cancellationToken);

        if (employerRole != null)
        {
            // Check if user already has EMPLOYER role
            var existingUserRole = await _unitOfWork.UserRoles.FirstOrDefaultAsync(
                ur => ur.UserId == request.RequesterId && ur.RoleId == employerRole.Id,
                cancellationToken);

            if (existingUserRole == null)
            {
                var userRole = new UserRole
                {
                    UserId = request.RequesterId,
                    RoleId = employerRole.Id,
                    AssignedAt = DateTime.UtcNow
                };
                await _unitOfWork.UserRoles.AddAsync(userRole, cancellationToken);
            }
        }

        // Save request update and role assignment
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(company);
        return Result<CompanyDto>.SuccessResult(dto, "Company registration approved successfully. User has been granted EMPLOYER role.");
    }

    public async Task<Result> RejectRequestAsync(int requestId, int adminUserId, string rejectionReason, CancellationToken cancellationToken = default)
    {
        var request = await _unitOfWork.CompanyRegistrationRequests.GetByIdAsync(requestId, cancellationToken);
        
        if (request == null)
        {
            return Result.FailureResult("Registration request not found");
        }

        if (request.Status != Domain.Enums.CompanyRequestStatus.Pending)
        {
            return Result.FailureResult($"Request has already been {request.Status.ToString().ToLower()}");
        }

        request.Status = Domain.Enums.CompanyRequestStatus.Rejected;
        request.ReviewedBy = adminUserId;
        request.ReviewedAt = DateTime.UtcNow;
        request.RejectionReason = rejectionReason;

        _unitOfWork.CompanyRegistrationRequests.Update(request);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Company registration rejected successfully");
    }

    private CompanyDto MapToDto(Company company)
    {
        return new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Description = company.Description,
            Address = company.Address,
            Website = company.Website,
            LogoUrl = company.LogoUrl,
            TaxCode = company.TaxCode,
            Industry = company.Industry,
            EmployeeCount = company.EmployeeCount,
            FoundedYear = company.FoundedYear,
            IsVerified = company.IsVerified,
            CreatedAt = company.CreatedAt
        };
    }

    private CompanyRegistrationRequestDto MapToRequestDto(CompanyRegistrationRequest request, User? requester, User? reviewer = null)
    {
        return new CompanyRegistrationRequestDto
        {
            Id = request.Id,
            RequesterId = request.RequesterId,
            RequesterEmail = requester?.Email ?? "Unknown",
            RequesterName = requester?.FullName ?? requester?.Email ?? "Unknown",
            CompanyName = request.CompanyName,
            TaxCode = request.TaxCode,
            Address = request.Address,
            Website = request.Website,
            Description = request.Description,
            Industry = request.Industry,
            EmployeeCount = request.EmployeeCount,
            FoundedYear = request.FoundedYear,
            Status = request.Status.ToString(),
            RejectionReason = request.RejectionReason,
            ReviewedBy = request.ReviewedBy,
            ReviewerName = reviewer?.FullName ?? reviewer?.Email,
            ReviewedAt = request.ReviewedAt,
            CreatedAt = request.CreatedAt
        };
    }
}
