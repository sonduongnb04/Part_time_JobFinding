using PTJ.Domain.Common;
using PTJ.Domain.Enums;

namespace PTJ.Domain.Entities;

public class CompanyRegistrationRequest : BaseAuditableEntity
{
    public int RequesterId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? TaxCode { get; set; }
    public string? Address { get; set; }
    public string? Website { get; set; }
    public string? Description { get; set; }
    public string? Industry { get; set; }
    public int? EmployeeCount { get; set; }
    public DateTime? FoundedYear { get; set; }
    public CompanyRequestStatus Status { get; set; } = CompanyRequestStatus.Pending;
    public string? RejectionReason { get; set; }
    public int? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public int? ApprovedCompanyId { get; set; }

    // Navigation properties
    public virtual User Requester { get; set; } = null!;
    public virtual User? Reviewer { get; set; }
    public virtual Company? ApprovedCompany { get; set; }
}
