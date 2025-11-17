namespace PTJ.Application.DTOs.Auth;

public class RegisterResponseDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string Role { get; set; } = string.Empty;
}

