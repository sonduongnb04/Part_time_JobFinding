using PTJ.Domain.Common;
using PTJ.Domain.Enums;

namespace PTJ.Domain.Entities;

public class Profile : BaseAuditableEntity
{
    public int UserId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public Gender? Gender { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? StudentId { get; set; }
    public string? University { get; set; }
    public string? Major { get; set; }
    public decimal? GPA { get; set; }
    public int? YearOfStudy { get; set; }
    public DateTime? ExpectedGraduationDate { get; set; }
    public string? ResumeUrl { get; set; }
    public string? Bio { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? GitHubUrl { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<ProfileSkill> Skills { get; set; } = new List<ProfileSkill>();
    public virtual ICollection<ProfileExperience> Experiences { get; set; } = new List<ProfileExperience>();
    public virtual ICollection<ProfileEducation> Educations { get; set; } = new List<ProfileEducation>();
    public virtual ICollection<ProfileCertificate> Certificates { get; set; } = new List<ProfileCertificate>();
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
}
