using PTJ.Application.Common;
using PTJ.Application.DTOs.Application;
using PTJ.Application.Services;
using PTJ.Domain.Entities;
using PTJ.Domain.Interfaces;

namespace PTJ.Infrastructure.Services;

public class ApplicationService : IApplicationService
{
    private readonly IUnitOfWork _unitOfWork;

    public ApplicationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ApplicationDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var application = await _unitOfWork.Applications.GetByIdAsync(id, cancellationToken);

        if (application == null)
        {
            return Result<ApplicationDto>.FailureResult("Application not found");
        }

        var dto = await MapToDtoAsync(application, cancellationToken);

        return Result<ApplicationDto>.SuccessResult(dto);
    }

    public async Task<Result<PaginatedList<ApplicationDto>>> GetByJobPostIdAsync(int jobPostId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var applications = await _unitOfWork.Applications.FindAsync(
            a => a.JobPostId == jobPostId,
            cancellationToken);

        var totalCount = applications.Count();
        var items = applications
            .OrderByDescending(a => a.AppliedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var dtos = new List<ApplicationDto>();
        foreach (var app in items)
        {
            dtos.Add(await MapToDtoAsync(app, cancellationToken));
        }

        var result = new PaginatedList<ApplicationDto>(dtos, totalCount, pageNumber, pageSize);

        return Result<PaginatedList<ApplicationDto>>.SuccessResult(result);
    }

    public async Task<Result<PaginatedList<ApplicationDto>>> GetByProfileIdAsync(int profileId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var applications = await _unitOfWork.Applications.FindAsync(
            a => a.ProfileId == profileId,
            cancellationToken);

        var totalCount = applications.Count();
        var items = applications
            .OrderByDescending(a => a.AppliedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var dtos = new List<ApplicationDto>();
        foreach (var app in items)
        {
            dtos.Add(await MapToDtoAsync(app, cancellationToken));
        }

        var result = new PaginatedList<ApplicationDto>(dtos, totalCount, pageNumber, pageSize);

        return Result<PaginatedList<ApplicationDto>>.SuccessResult(result);
    }

    public async Task<Result<ApplicationDto>> CreateAsync(int userId, CreateApplicationDto dto, CancellationToken cancellationToken = default)
    {
        // Check if job post exists
        var jobPost = await _unitOfWork.JobPosts.GetByIdAsync(dto.JobPostId, cancellationToken);
        if (jobPost == null)
        {
            return Result<ApplicationDto>.FailureResult("Job post not found");
        }

        // Get user's profile
        var profile = await _unitOfWork.Profiles.FirstOrDefaultAsync(
            p => p.UserId == userId,
            cancellationToken);

        if (profile == null)
        {
            return Result<ApplicationDto>.FailureResult("Please create a profile before applying");
        }

        // Check if already applied
        var existingApplication = await _unitOfWork.Applications.FirstOrDefaultAsync(
            a => a.JobPostId == dto.JobPostId && a.ProfileId == profile.Id,
            cancellationToken);

        if (existingApplication != null)
        {
            return Result<ApplicationDto>.FailureResult("You have already applied for this job");
        }

        // Get default status (Pending)
        var pendingStatus = await _unitOfWork.ApplicationStatuses.FirstOrDefaultAsync(
            s => s.Name == "Pending",
            cancellationToken);

        if (pendingStatus == null)
        {
            return Result<ApplicationDto>.FailureResult("Application status configuration error");
        }

        var application = new Domain.Entities.Application
        {
            JobPostId = dto.JobPostId,
            ProfileId = profile.Id,
            StatusId = pendingStatus.Id,
            CoverLetter = dto.CoverLetter,
            ResumeUrl = dto.ResumeUrl,
            AppliedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Applications.AddAsync(application, cancellationToken);

        // Increment application count on job post
        jobPost.ApplicationCount++;
        _unitOfWork.JobPosts.Update(jobPost);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var responseDto = await MapToDtoAsync(application, cancellationToken);

        return Result<ApplicationDto>.SuccessResult(responseDto, "Application submitted successfully");
    }

    public async Task<Result> UpdateStatusAsync(int id, int statusId, int userId, string? notes = null, CancellationToken cancellationToken = default)
    {
        var application = await _unitOfWork.Applications.GetByIdAsync(id, cancellationToken);

        if (application == null)
        {
            return Result.FailureResult("Application not found");
        }

        // Check if status exists
        var newStatus = await _unitOfWork.ApplicationStatuses.GetByIdAsync(statusId, cancellationToken);
        if (newStatus == null)
        {
            return Result.FailureResult("Invalid status");
        }

        // Get job post to check permission
        var jobPost = await _unitOfWork.JobPosts.GetByIdAsync(application.JobPostId, cancellationToken);
        if (jobPost == null)
        {
            return Result.FailureResult("Job post not found");
        }

        // Check permission (must be job post creator or company owner)
        var company = await _unitOfWork.Companies.GetByIdAsync(jobPost.CompanyId, cancellationToken);
        if (company == null || (jobPost.CreatedByUserId != userId && company.OwnerId != userId))
        {
            return Result.FailureResult("You don't have permission to update this application");
        }

        // Create history record
        var history = new ApplicationHistory
        {
            ApplicationId = id,
            FromStatusId = application.StatusId,
            ToStatusId = statusId,
            ChangedBy = userId,
            ChangedAt = DateTime.UtcNow,
            Notes = notes,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.ApplicationHistories.AddAsync(history, cancellationToken);

        // Update application
        application.StatusId = statusId;
        application.ReviewedBy = userId;
        application.ReviewedAt = DateTime.UtcNow;
        application.ReviewNotes = notes;
        application.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Applications.Update(application);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult($"Application status updated to {newStatus.Name}");
    }

    public async Task<Result> WithdrawAsync(int id, int userId, CancellationToken cancellationToken = default)
    {
        var application = await _unitOfWork.Applications.GetByIdAsync(id, cancellationToken);

        if (application == null)
        {
            return Result.FailureResult("Application not found");
        }

        // Check ownership
        var profile = await _unitOfWork.Profiles.GetByIdAsync(application.ProfileId, cancellationToken);
        if (profile == null || profile.UserId != userId)
        {
            return Result.FailureResult("You don't have permission to withdraw this application");
        }

        // Get withdrawn status
        var withdrawnStatus = await _unitOfWork.ApplicationStatuses.FirstOrDefaultAsync(
            s => s.Name == "Withdrawn",
            cancellationToken);

        if (withdrawnStatus == null)
        {
            return Result.FailureResult("Application status configuration error");
        }

        // Create history record
        var history = new ApplicationHistory
        {
            ApplicationId = id,
            FromStatusId = application.StatusId,
            ToStatusId = withdrawnStatus.Id,
            ChangedBy = userId,
            ChangedAt = DateTime.UtcNow,
            Notes = "Application withdrawn by applicant",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.ApplicationHistories.AddAsync(history, cancellationToken);

        // Update application
        application.StatusId = withdrawnStatus.Id;
        application.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Applications.Update(application);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Application withdrawn successfully");
    }

    private async Task<ApplicationDto> MapToDtoAsync(Domain.Entities.Application application, CancellationToken cancellationToken)
    {
        var jobPost = await _unitOfWork.JobPosts.GetByIdAsync(application.JobPostId, cancellationToken);
        var profile = await _unitOfWork.Profiles.GetByIdAsync(application.ProfileId, cancellationToken);
        var status = await _unitOfWork.ApplicationStatuses.GetByIdAsync(application.StatusId, cancellationToken);

        return new ApplicationDto
        {
            Id = application.Id,
            JobPostId = application.JobPostId,
            JobTitle = jobPost?.Title ?? "Unknown",
            ProfileId = application.ProfileId,
            ApplicantUserId = profile?.UserId ?? 0,
            ApplicantName = profile != null ? $"{profile.FirstName} {profile.LastName}".Trim() : "Unknown",
            StatusId = application.StatusId,
            StatusName = status?.Name ?? "Unknown",
            CoverLetter = application.CoverLetter,
            ResumeUrl = application.ResumeUrl,
            AppliedAt = application.AppliedAt,
            ReviewedAt = application.ReviewedAt,
            ReviewNotes = application.ReviewNotes
        };
    }
}
