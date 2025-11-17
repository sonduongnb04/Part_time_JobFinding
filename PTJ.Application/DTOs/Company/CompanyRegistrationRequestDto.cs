using System.ComponentModel.DataAnnotations;

namespace PTJ.Application.DTOs.Company;

public class CompanyRegistrationRequestDto
{
    public int Id { get; set; }
    public int RequesterId { get; set; }
    public string RequesterEmail { get; set; } = string.Empty;
    public string RequesterName { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? TaxCode { get; set; }
    public string? Address { get; set; }
    public string? Website { get; set; }
    public string? Description { get; set; }
    public string? Industry { get; set; }
    public int? EmployeeCount { get; set; }
    public DateTime? FoundedYear { get; set; }
    public string Status { get; set; } = string.Empty; // Pending, Approved, Rejected
    public string? RejectionReason { get; set; }
    public int? ReviewedBy { get; set; }
    public string? ReviewerName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ApproveCompanyRequestDto
{
    [Required]
    public int RequestId { get; set; }
}

public class RejectCompanyRequestDto
{
    [Required]
    public int RequestId { get; set; }
    
    [Required(ErrorMessage = "Rejection reason is required")]
    [MinLength(10, ErrorMessage = "Rejection reason must be at least 10 characters")]
    public string RejectionReason { get; set; } = string.Empty;
}

