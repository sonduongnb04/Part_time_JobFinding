using PTJ.Domain.Common;

namespace PTJ.Domain.Entities;

public class Company : BaseAuditableEntity
{
    public int OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public string? TaxCode { get; set; }
    public string? Industry { get; set; }
    public int? EmployeeCount { get; set; }
    public DateTime? FoundedYear { get; set; }
    public bool IsVerified { get; set; }

    // Navigation properties
    public virtual User Owner { get; set; } = null!;
    public virtual ICollection<JobPost> JobPosts { get; set; } = new List<JobPost>();
}
