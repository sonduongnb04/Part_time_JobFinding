using Microsoft.EntityFrameworkCore;
using PTJ.Application.Common;
using PTJ.Application.DTOs.JobPost;
using PTJ.Application.Services;
using PTJ.Domain.Entities;
using PTJ.Domain.Enums;
using PTJ.Domain.Interfaces;

namespace PTJ.Infrastructure.Services;

public class JobPostService : IJobPostService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ISearchService _searchService;

    public JobPostService(IUnitOfWork unitOfWork, ISearchService searchService)
    {
        _unitOfWork = unitOfWork;
        _searchService = searchService;
    }


    public async Task<Result<JobPostDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var jobPost = await _unitOfWork.JobPosts.GetByIdAsync(id, cancellationToken);

        if (jobPost == null)
        {
            return Result<JobPostDto>.FailureResult("Job post not found");
        }

        // Load related data
        var company = await _unitOfWork.Companies.GetByIdAsync(jobPost.CompanyId, cancellationToken);
        var shifts = await _unitOfWork.JobShifts.FindAsync(s => s.JobPostId == id, cancellationToken);
        var skills = await _unitOfWork.JobPostSkills.FindAsync(s => s.JobPostId == id, cancellationToken);

        var dto = MapToDto(jobPost, company, shifts.ToList(), skills.ToList());

        return Result<JobPostDto>.SuccessResult(dto);
    }

    public async Task<Result<PaginatedList<JobPostDto>>> GetAllAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var allJobPosts = await _unitOfWork.JobPosts.GetAllAsync(cancellationToken);
        var activeJobPosts = allJobPosts.Where(jp => jp.Status == JobPostStatus.Active).ToList();

        var totalCount = activeJobPosts.Count;
        var items = activeJobPosts
            .OrderByDescending(jp => jp.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var dtos = new List<JobPostDto>();
        foreach (var jobPost in items)
        {
            var company = await _unitOfWork.Companies.GetByIdAsync(jobPost.CompanyId, cancellationToken);
            var shifts = await _unitOfWork.JobShifts.FindAsync(s => s.JobPostId == jobPost.Id, cancellationToken);
            var skills = await _unitOfWork.JobPostSkills.FindAsync(s => s.JobPostId == jobPost.Id, cancellationToken);

            dtos.Add(MapToDto(jobPost, company, shifts.ToList(), skills.ToList()));
        }

        var result = new PaginatedList<JobPostDto>(dtos, totalCount, pageNumber, pageSize);

        return Result<PaginatedList<JobPostDto>>.SuccessResult(result);
    }

    public async Task<Result<PaginatedList<JobPostDto>>> SearchAsync(SearchParameters parameters, CancellationToken cancellationToken = default)
    {
        return await _searchService.SearchJobPostsAsync(parameters, cancellationToken);
    }

    public async Task<Result<PaginatedList<JobPostDto>>> GetByCompanyIdAsync(int companyId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var jobPosts = await _unitOfWork.JobPosts.FindAsync(jp => jp.CompanyId == companyId, cancellationToken);
        var totalCount = jobPosts.Count();

        var items = jobPosts
            .OrderByDescending(jp => jp.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var company = await _unitOfWork.Companies.GetByIdAsync(companyId, cancellationToken);

        var dtos = new List<JobPostDto>();
        foreach (var jobPost in items)
        {
            var shifts = await _unitOfWork.JobShifts.FindAsync(s => s.JobPostId == jobPost.Id, cancellationToken);
            var skills = await _unitOfWork.JobPostSkills.FindAsync(s => s.JobPostId == jobPost.Id, cancellationToken);

            dtos.Add(MapToDto(jobPost, company, shifts.ToList(), skills.ToList()));
        }

        var result = new PaginatedList<JobPostDto>(dtos, totalCount, pageNumber, pageSize);

        return Result<PaginatedList<JobPostDto>>.SuccessResult(result);
    }

    public async Task<Result<JobPostDto>> CreateAsync(int userId, CreateJobPostDto dto, CancellationToken cancellationToken = default)
    {
        // Check if user has a company
        var company = await _unitOfWork.Companies.FirstOrDefaultAsync(c => c.OwnerId == userId, cancellationToken);

        if (company == null)
        {
            return Result<JobPostDto>.FailureResult("You must have a company to create job posts");
        }

        var jobPost = new JobPost
        {
            CompanyId = company.Id,
            CreatedByUserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            Requirements = dto.Requirements,
            Benefits = dto.Benefits,
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            SalaryPeriod = dto.SalaryPeriod,
            Location = dto.Location,
            WorkType = dto.WorkType,
            Category = dto.Category,
            NumberOfPositions = dto.NumberOfPositions,
            ApplicationDeadline = dto.ApplicationDeadline,
            Status = JobPostStatus.Pending,
            ViewCount = 0,
            ApplicationCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.JobPosts.AddAsync(jobPost, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Add shifts
        foreach (var shiftDto in dto.Shifts)
        {
            var shift = new JobShift
            {
                JobPostId = jobPost.Id,
                DayOfWeek = shiftDto.DayOfWeek,
                StartTime = shiftDto.StartTime,
                EndTime = shiftDto.EndTime,
                Notes = shiftDto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.JobShifts.AddAsync(shift, cancellationToken);
        }

        // Add required skills
        foreach (var skillName in dto.RequiredSkills)
        {
            var skill = new JobPostSkill
            {
                JobPostId = jobPost.Id,
                SkillName = skillName,
                IsRequired = true,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.JobPostSkills.AddAsync(skill, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Load data for response
        var shifts = await _unitOfWork.JobShifts.FindAsync(s => s.JobPostId == jobPost.Id, cancellationToken);
        var skills = await _unitOfWork.JobPostSkills.FindAsync(s => s.JobPostId == jobPost.Id, cancellationToken);

        var responseDto = MapToDto(jobPost, company, shifts.ToList(), skills.ToList());

        return Result<JobPostDto>.SuccessResult(responseDto, "Job post created successfully");
    }

    public async Task<Result<JobPostDto>> UpdateAsync(int id, int userId, UpdateJobPostDto dto, CancellationToken cancellationToken = default)
    {
        var jobPost = await _unitOfWork.JobPosts.GetByIdAsync(id, cancellationToken);

        if (jobPost == null)
        {
            return Result<JobPostDto>.FailureResult("Job post not found");
        }

        // Check ownership
        if (jobPost.CreatedByUserId != userId)
        {
            var userCompany = await _unitOfWork.Companies.FirstOrDefaultAsync(c => c.OwnerId == userId, cancellationToken);
            if (userCompany == null || userCompany.Id != jobPost.CompanyId)
            {
                return Result<JobPostDto>.FailureResult("You don't have permission to update this job post");
            }
        }

        // Update fields
        if (dto.Title != null) jobPost.Title = dto.Title;
        if (dto.Description != null) jobPost.Description = dto.Description;
        if (dto.Requirements != null) jobPost.Requirements = dto.Requirements;
        if (dto.Benefits != null) jobPost.Benefits = dto.Benefits;
        if (dto.SalaryMin.HasValue) jobPost.SalaryMin = dto.SalaryMin;
        if (dto.SalaryMax.HasValue) jobPost.SalaryMax = dto.SalaryMax;
        if (dto.SalaryPeriod != null) jobPost.SalaryPeriod = dto.SalaryPeriod;
        if (dto.Location != null) jobPost.Location = dto.Location;
        if (dto.WorkType != null) jobPost.WorkType = dto.WorkType;
        if (dto.Category != null) jobPost.Category = dto.Category;
        if (dto.NumberOfPositions.HasValue) jobPost.NumberOfPositions = dto.NumberOfPositions;
        if (dto.ApplicationDeadline.HasValue) jobPost.ApplicationDeadline = dto.ApplicationDeadline;

        jobPost.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.JobPosts.Update(jobPost);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Load data for response
        var company = await _unitOfWork.Companies.GetByIdAsync(jobPost.CompanyId, cancellationToken);
        var shifts = await _unitOfWork.JobShifts.FindAsync(s => s.JobPostId == id, cancellationToken);
        var skills = await _unitOfWork.JobPostSkills.FindAsync(s => s.JobPostId == id, cancellationToken);

        var responseDto = MapToDto(jobPost, company, shifts.ToList(), skills.ToList());

        return Result<JobPostDto>.SuccessResult(responseDto, "Job post updated successfully");
    }

    public async Task<Result> DeleteAsync(int id, int userId, CancellationToken cancellationToken = default)
    {
        var jobPost = await _unitOfWork.JobPosts.GetByIdAsync(id, cancellationToken);

        if (jobPost == null)
        {
            return Result.FailureResult("Job post not found");
        }

        // Check ownership
        if (jobPost.CreatedByUserId != userId)
        {
            var company = await _unitOfWork.Companies.FirstOrDefaultAsync(c => c.OwnerId == userId, cancellationToken);
            if (company == null || company.Id != jobPost.CompanyId)
            {
                return Result.FailureResult("You don't have permission to delete this job post");
            }
        }

        _unitOfWork.JobPosts.Remove(jobPost);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Job post deleted successfully");
    }

    public async Task<Result> ChangeStatusAsync(int id, int userId, JobPostStatus status, CancellationToken cancellationToken = default)
    {
        var jobPost = await _unitOfWork.JobPosts.GetByIdAsync(id, cancellationToken);

        if (jobPost == null)
        {
            return Result.FailureResult("Job post not found");
        }

        // Check ownership
        if (jobPost.CreatedByUserId != userId)
        {
            var company = await _unitOfWork.Companies.FirstOrDefaultAsync(c => c.OwnerId == userId, cancellationToken);
            if (company == null || company.Id != jobPost.CompanyId)
            {
                return Result.FailureResult("You don't have permission to change this job post status");
            }
        }

        jobPost.Status = status;
        jobPost.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.JobPosts.Update(jobPost);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult($"Job post status changed to {status}");
    }

    public async Task<Result> IncrementViewCountAsync(int id, CancellationToken cancellationToken = default)
    {
        var jobPost = await _unitOfWork.JobPosts.GetByIdAsync(id, cancellationToken);

        if (jobPost == null)
        {
            return Result.FailureResult("Job post not found");
        }

        jobPost.ViewCount++;
        _unitOfWork.JobPosts.Update(jobPost);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("View count incremented");
    }

    private JobPostDto MapToDto(JobPost jobPost, Company? company, List<JobShift> shifts, List<JobPostSkill> skills)
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
}
