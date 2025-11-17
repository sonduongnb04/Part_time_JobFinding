using PTJ.Domain.Common;

namespace PTJ.Domain.Entities;

public class ProfileCertificate : BaseEntity
{
    public int ProfileId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? IssuingOrganization { get; set; }
    public DateTime? IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CredentialId { get; set; }
    public string? CredentialUrl { get; set; }
    public string? CertificateFileUrl { get; set; }

    // Navigation properties
    public virtual Profile Profile { get; set; } = null!;
}
