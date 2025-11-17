using Microsoft.EntityFrameworkCore;
using PTJ.Application.Common;
using PTJ.Application.DTOs.Auth;
using PTJ.Application.Services;
using PTJ.Domain.Entities;
using PTJ.Domain.Interfaces;

namespace PTJ.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;

    public AuthService(IUnitOfWork unitOfWork, IJwtService jwtService)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
    }

    public async Task<Result<RegisterResponseDto>> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default)
    {
        // Check if email already exists
        var existingUser = await _unitOfWork.Users.FirstOrDefaultAsync(
            u => u.Email == dto.Email,
            cancellationToken);

        if (existingUser != null)
        {
            return Result<RegisterResponseDto>.FailureResult("Email already exists");
        }

        // Get STUDENT role (default role for all new users)
        var studentRole = await _unitOfWork.Roles.FirstOrDefaultAsync(
            r => r.Name == "STUDENT",
            cancellationToken);

        if (studentRole == null)
        {
            return Result<RegisterResponseDto>.FailureResult("STUDENT role not found in system");
        }

        // Create user
        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FullName = dto.FullName,
            PhoneNumber = dto.PhoneNumber,
            IsEmailVerified = false,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Assign STUDENT role
        var userRole = new UserRole
        {
            UserId = user.Id,
            RoleId = studentRole.Id,
            AssignedAt = DateTime.UtcNow
        };

        await _unitOfWork.UserRoles.AddAsync(userRole, cancellationToken);

        // Create Profile automatically
        var profile = new Profile
        {
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow
        };
        await _unitOfWork.Profiles.AddAsync(profile, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new RegisterResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = studentRole.Name
        };

        return Result<RegisterResponseDto>.SuccessResult(response, "Registration successful. Please login to continue.");
    }

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto, string ipAddress, CancellationToken cancellationToken = default)
    {
        // Find user by email
        var user = await _unitOfWork.Users.FirstOrDefaultAsync(
            u => u.Email == dto.Email,
            cancellationToken);

        if (user == null)
        {
            return Result<AuthResponseDto>.FailureResult("Invalid email or password");
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Result<AuthResponseDto>.FailureResult("Invalid email or password");
        }

        // Check if user is active
        if (!user.IsActive)
        {
            return Result<AuthResponseDto>.FailureResult("Account is deactivated");
        }

        // Get user roles
        var userRoles = await _unitOfWork.UserRoles.FindAsync(
            ur => ur.UserId == user.Id,
            cancellationToken);

        var roleIds = userRoles.Select(ur => ur.RoleId).ToList();
        var roles = new List<string>();

        foreach (var roleId in roleIds)
        {
            var role = await _unitOfWork.Roles.GetByIdAsync(roleId, cancellationToken);
            if (role != null)
            {
                roles.Add(role.Name);
            }
        }

        // Generate tokens
        var accessToken = _jwtService.GenerateAccessToken(user, roles);
        var refreshToken = _jwtService.GenerateRefreshToken();

        // Save refresh token
        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedByIp = ipAddress,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.RefreshTokens.AddAsync(refreshTokenEntity, cancellationToken);

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        _unitOfWork.Users.Update(user);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Roles = roles,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60)
        };

        return Result<AuthResponseDto>.SuccessResult(response, "Login successful");
    }

    public async Task<Result<AuthResponseDto>> RefreshTokenAsync(string refreshToken, string ipAddress, CancellationToken cancellationToken = default)
    {
        var token = await _unitOfWork.RefreshTokens.FirstOrDefaultAsync(
            rt => rt.Token == refreshToken,
            cancellationToken);

        if (token == null || !token.IsActive)
        {
            return Result<AuthResponseDto>.FailureResult("Invalid refresh token");
        }

        // Get user
        var user = await _unitOfWork.Users.GetByIdAsync(token.UserId, cancellationToken);
        if (user == null || !user.IsActive)
        {
            return Result<AuthResponseDto>.FailureResult("User not found or inactive");
        }

        // Get user roles
        var userRoles = await _unitOfWork.UserRoles.FindAsync(
            ur => ur.UserId == user.Id,
            cancellationToken);

        var roleIds = userRoles.Select(ur => ur.RoleId).ToList();
        var roles = new List<string>();

        foreach (var roleId in roleIds)
        {
            var role = await _unitOfWork.Roles.GetByIdAsync(roleId, cancellationToken);
            if (role != null)
            {
                roles.Add(role.Name);
            }
        }

        // Generate new tokens
        var newAccessToken = _jwtService.GenerateAccessToken(user, roles);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        // Revoke old token
        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;
        token.RevokedByIp = ipAddress;
        token.ReplacedByToken = newRefreshToken;
        _unitOfWork.RefreshTokens.Update(token);

        // Save new refresh token
        var newRefreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(30),
            CreatedByIp = ipAddress,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.RefreshTokens.AddAsync(newRefreshTokenEntity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Roles = roles,
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60)
        };

        return Result<AuthResponseDto>.SuccessResult(response, "Token refreshed successfully");
    }

    public async Task<Result> RevokeTokenAsync(string refreshToken, int userId, string ipAddress, CancellationToken cancellationToken = default)
    {
        var token = await _unitOfWork.RefreshTokens.FirstOrDefaultAsync(
            rt => rt.Token == refreshToken && rt.UserId == userId,
            cancellationToken);

        if (token == null)
        {
            return Result.FailureResult("Invalid refresh token");
        }

        if (!token.IsActive)
        {
            return Result.FailureResult("Token already revoked or expired");
        }

        // Revoke token
        token.IsRevoked = true;
        token.RevokedAt = DateTime.UtcNow;
        token.RevokedByIp = ipAddress;
        _unitOfWork.RefreshTokens.Update(token);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Logout successful");
    }
}
