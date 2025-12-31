using Microsoft.EntityFrameworkCore;
using PTJ.Application.Common;
using PTJ.Application.Services;
using PTJ.Domain.Enums;
using PTJ.Domain.Interfaces;

namespace PTJ.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> LockUserAsync(int userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            return Result.FailureResult("User not found");
        }

        if (!user.IsActive)
        {
            return Result.FailureResult("User is already locked");
        }

        user.IsActive = false;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return Result.SuccessResult("User account locked successfully");
    }

    public async Task<Result> UnlockUserAsync(int userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            return Result.FailureResult("User not found");
        }

        if (user.IsActive)
        {
            return Result.FailureResult("User is already active");
        }

        user.IsActive = true;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return Result.SuccessResult("User account unlocked successfully");
    }

    public async Task<Result<PaginatedList<object>>> GetUsersAsync(string? search, int pageNumber, int pageSize)
    {
        var query = _unitOfWork.Users.GetQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(u => 
                (u.Email != null && u.Email.ToLower().Contains(search)) || 
                (u.FullName != null && u.FullName.ToLower().Contains(search)) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(search))
            );
        }

        var totalCount = await query.CountAsync();
        
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.Email,
                u.FullName,
                u.PhoneNumber,
                u.AvatarUrl,
                u.IsActive,
                u.IsEmailVerified,
                u.CreatedAt,
                u.LastLoginAt
            })
            .ToListAsync();

        var paginated = new PaginatedList<object>(items.Cast<object>().ToList(), totalCount, pageNumber, pageSize);
        return Result<PaginatedList<object>>.SuccessResult(paginated);
    }

    public async Task<Result> UpdateJobPostStatusAsync(int id, JobPostStatus status)
    {
        var jobPost = await _unitOfWork.JobPosts.GetByIdAsync(id);
        if (jobPost == null)
        {
            return Result.FailureResult("Job post not found");
        }

        jobPost.Status = status;
        _unitOfWork.JobPosts.Update(jobPost);
        await _unitOfWork.SaveChangesAsync();

        return Result.SuccessResult($"Job post status updated to {status}");
    }

    public async Task<Result> DeleteJobPostAsync(int id)
    {
        var jobPost = await _unitOfWork.JobPosts.GetByIdAsync(id);
        if (jobPost == null)
        {
            return Result.FailureResult("Job post not found");
        }

        _unitOfWork.JobPosts.Remove(jobPost);
        await _unitOfWork.SaveChangesAsync();

        return Result.SuccessResult("Job post deleted successfully");
    }

    public async Task<Result<object>> GetDashboardStatsAsync()
    {
        var totalUsers = await _unitOfWork.Users.CountAsync();
        var activeUsers = await _unitOfWork.Users.CountAsync(u => u.IsActive);
        
        var totalJobs = await _unitOfWork.JobPosts.CountAsync();
        var activeJobs = await _unitOfWork.JobPosts.CountAsync(j => j.Status == JobPostStatus.Active);
        var closedJobs = await _unitOfWork.JobPosts.CountAsync(j => j.Status == JobPostStatus.Closed);
        var draftJobs = await _unitOfWork.JobPosts.CountAsync(j => j.Status == JobPostStatus.Draft);

        var totalCompanies = await _unitOfWork.Companies.CountAsync();
        var totalApplications = await _unitOfWork.Applications.CountAsync();

        var stats = new
        {
            Users = new
            {
                Total = totalUsers,
                Active = activeUsers,
                Locked = totalUsers - activeUsers
            },
            Jobs = new
            {
                Total = totalJobs,
                Active = activeJobs,
                Closed = closedJobs,
                Draft = draftJobs
            },
            Companies = new
            {
                Total = totalCompanies
            },
            Applications = new
            {
                Total = totalApplications
            }
        };

        return Result<object>.SuccessResult(stats);
    }
}
