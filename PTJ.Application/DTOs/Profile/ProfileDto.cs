using PTJ.Domain.Enums;

namespace PTJ.Application.DTOs.Profile;

public class ProfileDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? FullName => $"{FirstName} {LastName}".Trim();
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
    public List<ProfileSkillDto> Skills { get; set; } = new();
    public List<ProfileExperienceDto> Experiences { get; set; } = new();
    public List<ProfileEducationDto> Educations { get; set; } = new();
    public List<ProfileCertificateDto> Certificates { get; set; } = new();
}

public class ProfileSkillDto
{
    public int Id { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public int? ProficiencyLevel { get; set; }
    public int? YearsOfExperience { get; set; }
}

public class ProfileExperienceDto
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrentlyWorking { get; set; }
}

public class ProfileEducationDto
{
    public int Id { get; set; }
    public string InstitutionName { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string? FieldOfStudy { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? GPA { get; set; }
    public string? Description { get; set; }
}

public class ProfileCertificateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? IssuingOrganization { get; set; }
    public DateTime? IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CredentialId { get; set; }
    public string? CredentialUrl { get; set; }
    public string? CertificateFileUrl { get; set; }
}
