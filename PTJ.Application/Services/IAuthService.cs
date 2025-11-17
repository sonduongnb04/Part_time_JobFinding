using PTJ.Application.Common;
using PTJ.Application.DTOs.Auth;

namespace PTJ.Application.Services;

public interface IAuthService
{
    Task<Result<RegisterResponseDto>> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default);
    Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto, string ipAddress, CancellationToken cancellationToken = default);
    Task<Result<AuthResponseDto>> RefreshTokenAsync(string refreshToken, string ipAddress, CancellationToken cancellationToken = default);
    Task<Result> RevokeTokenAsync(string refreshToken, int userId, string ipAddress, CancellationToken cancellationToken = default);
}
