namespace PTJ.Application.DTOs.Auth;

public class AuthResponseDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public List<string> Roles { get; set; } = new();
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
