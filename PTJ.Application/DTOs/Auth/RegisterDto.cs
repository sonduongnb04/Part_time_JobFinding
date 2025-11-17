using System.ComponentModel.DataAnnotations;

namespace PTJ.Application.DTOs.Auth;

public class RegisterDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Password is required")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string Password { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Confirm password is required")]
    [Compare("Password", ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;
    
    public string? FullName { get; set; }
    
    [Phone(ErrorMessage = "Invalid phone number format")]
    public string? PhoneNumber { get; set; }
}
