using Microsoft.EntityFrameworkCore;
using PTJ.Application.Common;
using PTJ.Application.DTOs.Company;
using PTJ.Application.DTOs.JobPost;
using PTJ.Application.Services;
using PTJ.Domain.Entities;
using PTJ.Domain.Enums;
using PTJ.Domain.Interfaces;

namespace PTJ.Infrastructure.Services;

public class SearchService : ISearchService
{
    private readonly IUnitOfWork _unitOfWork;

    public SearchService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedList<JobPostDto>>> SearchJobPostsAsync(SearchParameters parameters, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.JobPosts.GetQueryable(); 

        // Filter
        query = query.Where(jp => jp.Status == JobPostStatus.Active);

        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var searchTerm = $"%{parameters.SearchTerm}%";
            query = query.Where(jp => 
                EF.Functions.Like(jp.Title, searchTerm) || 
                EF.Functions.Like(jp.Description ?? "", searchTerm) || 
                EF.Functions.Like(jp.Location ?? "", searchTerm)
            );
        }

        // Sorting
        var isSalarySort = !string.IsNullOrEmpty(parameters.SortBy) && parameters.SortBy.ToLower() == "salary";
        
        if (isSalarySort)
        {
            query = parameters.SortDescending
                ? query.OrderByDescending(jp => jp.SalaryMax ?? 0)
                : query.OrderBy(jp => jp.SalaryMin ?? 0);
        }
        else
        {
            query = parameters.SortDescending
                ? query.OrderByDescending(jp => jp.CreatedAt)
                : query.OrderBy(jp => jp.CreatedAt);
        }

        // Count
        var totalCount = await query.CountAsync(cancellationToken);

        // Include + Paging
        var items = await query
            .Include(jp => jp.Company)
            .Include(jp => jp.Shifts)
            .Include(jp => jp.RequiredSkills)
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .AsSplitQuery() 
            .ToListAsync(cancellationToken);

        // Map
        var dtos = items.Select(jobPost => MapToJobPostDto(
            jobPost, 
            jobPost.Company, 
            jobPost.Shifts.ToList(), 
            jobPost.RequiredSkills.ToList()
        )).ToList();

        var result = new PaginatedList<JobPostDto>(dtos, totalCount, parameters.PageNumber, parameters.PageSize);
        return Result<PaginatedList<JobPostDto>>.SuccessResult(result);
    }

    public async Task<Result<PaginatedList<CompanyDto>>> SearchCompaniesAsync(SearchParameters parameters, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Companies.GetQueryable();

        if (!string.IsNullOrWhiteSpace(parameters.SearchTerm))
        {
            var searchTerm = $"%{parameters.SearchTerm}%";
            query = query.Where(c =>
                EF.Functions.Like(c.Name, searchTerm) ||
                EF.Functions.Like(c.Description ?? "", searchTerm) ||
                EF.Functions.Like(c.Industry ?? "", searchTerm) ||
                EF.Functions.Like(c.Address ?? "", searchTerm));
        }

        // Sorting
        query = parameters.SortDescending
            ? query.OrderByDescending(c => c.CreatedAt)
            : query.OrderBy(c => c.CreatedAt);

        // Count
        var totalCount = await query.CountAsync(cancellationToken);
        
        // Paging
        var items = await query
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync(cancellationToken);
            
        // Map
        var dtos = items.Select(MapToCompanyDto).ToList();

        var result = new PaginatedList<CompanyDto>(dtos, totalCount, parameters.PageNumber, parameters.PageSize);

        return Result<PaginatedList<CompanyDto>>.SuccessResult(result);
    }

    private JobPostDto MapToJobPostDto(JobPost jobPost, Company? company, List<JobShift> shifts, List<JobPostSkill> skills)
    {
        return new JobPostDto
        {
            Id = jobPost.Id,
            CompanyId = jobPost.CompanyId,
            CompanyName = company?.Name ?? "Unknown",
            CompanyLogoUrl = company?.LogoUrl,
            Title = jobPost.Title,
            Description = jobPost.Description,
            Requirements = jobPost.Requirements,
            Benefits = jobPost.Benefits,
            SalaryMin = jobPost.SalaryMin,
            SalaryMax = jobPost.SalaryMax,
            SalaryPeriod = jobPost.SalaryPeriod,
            Location = jobPost.Location,
            WorkType = jobPost.WorkType,
            Category = jobPost.Category,
            NumberOfPositions = jobPost.NumberOfPositions,
            ApplicationDeadline = jobPost.ApplicationDeadline,
            Status = jobPost.Status,
            ViewCount = jobPost.ViewCount,
            ApplicationCount = jobPost.ApplicationCount,
            IsFeatured = jobPost.IsFeatured,
            IsUrgent = jobPost.IsUrgent,
            CreatedAt = jobPost.CreatedAt,
            Shifts = shifts.Select(s => new JobShiftDto
            {
                Id = s.Id,
                DayOfWeek = s.DayOfWeek,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Notes = s.Notes
            }).ToList(),
            RequiredSkills = skills.Select(s => s.SkillName).ToList()
        };
    }

    private CompanyDto MapToCompanyDto(Company company)
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
}
