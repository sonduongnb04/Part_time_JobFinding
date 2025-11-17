using PTJ.Domain.Entities;

namespace PTJ.Application.Services;

public interface IJwtService
{
    string GenerateAccessToken(User user, List<string> roles);
    string GenerateRefreshToken();
}
