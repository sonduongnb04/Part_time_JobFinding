using PTJ.Application.Common;
using PTJ.Application.DTOs.Profile;
using PTJ.Application.Services;
using PTJ.Domain.Entities;
using PTJ.Domain.Interfaces;

namespace PTJ.Infrastructure.Services;

public class ProfileService : IProfileService
{
    private readonly IUnitOfWork _unitOfWork;

    public ProfileService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProfileDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var profile = await _unitOfWork.Profiles.GetByIdAsync(id, cancellationToken);

        if (profile == null)
        {
            return Result<ProfileDto>.FailureResult("Profile not found");
        }

        var dto = await MapToDtoAsync(profile, cancellationToken);

        return Result<ProfileDto>.SuccessResult(dto);
    }

    public async Task<Result<ProfileDto>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        var profile = await _unitOfWork.Profiles.FirstOrDefaultAsync(
            p => p.UserId == userId,
            cancellationToken);

        if (profile == null)
        {
            return Result<ProfileDto>.FailureResult("Profile not found for this user");
        }

        var dto = await MapToDtoAsync(profile, cancellationToken);

        return Result<ProfileDto>.SuccessResult(dto);
    }

    public async Task<Result<ProfileDto>> CreateOrUpdateAsync(int userId, ProfileDto dto, CancellationToken cancellationToken = default)
    {
        // Check if profile exists
        var existingProfile = await _unitOfWork.Profiles.FirstOrDefaultAsync(
            p => p.UserId == userId,
            cancellationToken);

        if (existingProfile != null)
        {
            // Update existing profile
            return await UpdateProfileAsync(existingProfile, dto, cancellationToken);
        }

        // Create new profile
        var profile = new Profile
        {
            UserId = userId,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            Address = dto.Address,
            City = dto.City,
            District = dto.District,
            StudentId = dto.StudentId,
            University = dto.University,
            Major = dto.Major,
            GPA = dto.GPA,
            YearOfStudy = dto.YearOfStudy,
            ExpectedGraduationDate = dto.ExpectedGraduationDate,
            ResumeUrl = dto.ResumeUrl,
            Bio = dto.Bio,
            LinkedInUrl = dto.LinkedInUrl,
            GitHubUrl = dto.GitHubUrl,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Profiles.AddAsync(profile, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Add skills
        foreach (var skillDto in dto.Skills)
        {
            var skill = new ProfileSkill
            {
                ProfileId = profile.Id,
                SkillName = skillDto.SkillName,
                ProficiencyLevel = skillDto.ProficiencyLevel,
                YearsOfExperience = skillDto.YearsOfExperience,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.ProfileSkills.AddAsync(skill, cancellationToken);
        }

        // Add experiences
        foreach (var expDto in dto.Experiences)
        {
            var experience = new ProfileExperience
            {
                ProfileId = profile.Id,
                CompanyName = expDto.CompanyName,
                Position = expDto.Position,
                Description = expDto.Description,
                StartDate = expDto.StartDate,
                EndDate = expDto.EndDate,
                IsCurrentlyWorking = expDto.IsCurrentlyWorking,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.ProfileExperiences.AddAsync(experience, cancellationToken);
        }

        // Add educations
        foreach (var eduDto in dto.Educations)
        {
            var education = new ProfileEducation
            {
                ProfileId = profile.Id,
                InstitutionName = eduDto.InstitutionName,
                Degree = eduDto.Degree,
                FieldOfStudy = eduDto.FieldOfStudy,
                StartDate = eduDto.StartDate,
                EndDate = eduDto.EndDate,
                GPA = eduDto.GPA,
                Description = eduDto.Description,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.ProfileEducations.AddAsync(education, cancellationToken);
        }

        // Add certificates
        foreach (var certDto in dto.Certificates)
        {
            var certificate = new ProfileCertificate
            {
                ProfileId = profile.Id,
                Name = certDto.Name,
                IssuingOrganization = certDto.IssuingOrganization,
                IssueDate = certDto.IssueDate,
                ExpiryDate = certDto.ExpiryDate,
                CredentialId = certDto.CredentialId,
                CredentialUrl = certDto.CredentialUrl,
                CertificateFileUrl = certDto.CertificateFileUrl,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.ProfileCertificates.AddAsync(certificate, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var responseDto = await MapToDtoAsync(profile, cancellationToken);

        return Result<ProfileDto>.SuccessResult(responseDto, "Profile created successfully");
    }

    public async Task<Result> DeleteAsync(int id, int userId, CancellationToken cancellationToken = default)
    {
        var profile = await _unitOfWork.Profiles.GetByIdAsync(id, cancellationToken);

        if (profile == null)
        {
            return Result.FailureResult("Profile not found");
        }

        // Check ownership
        if (profile.UserId != userId)
        {
            return Result.FailureResult("You don't have permission to delete this profile");
        }

        _unitOfWork.Profiles.Remove(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.SuccessResult("Profile deleted successfully");
    }

    private async Task<Result<ProfileDto>> UpdateProfileAsync(Profile profile, ProfileDto dto, CancellationToken cancellationToken)
    {
        // Update basic info
        profile.FirstName = dto.FirstName;
        profile.LastName = dto.LastName;
        profile.DateOfBirth = dto.DateOfBirth;
        profile.Gender = dto.Gender;
        profile.Address = dto.Address;
        profile.City = dto.City;
        profile.District = dto.District;
        profile.StudentId = dto.StudentId;
        profile.University = dto.University;
        profile.Major = dto.Major;
        profile.GPA = dto.GPA;
        profile.YearOfStudy = dto.YearOfStudy;
        profile.ExpectedGraduationDate = dto.ExpectedGraduationDate;
        profile.ResumeUrl = dto.ResumeUrl;
        profile.Bio = dto.Bio;
        profile.LinkedInUrl = dto.LinkedInUrl;
        profile.GitHubUrl = dto.GitHubUrl;
        profile.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Profiles.Update(profile);

        // Remove old skills and add new ones
        var oldSkills = await _unitOfWork.ProfileSkills.FindAsync(s => s.ProfileId == profile.Id, cancellationToken);
        _unitOfWork.ProfileSkills.RemoveRange(oldSkills);

        foreach (var skillDto in dto.Skills)
        {
            var skill = new ProfileSkill
            {
                ProfileId = profile.Id,
                SkillName = skillDto.SkillName,
                ProficiencyLevel = skillDto.ProficiencyLevel,
                YearsOfExperience = skillDto.YearsOfExperience,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.ProfileSkills.AddAsync(skill, cancellationToken);
        }

        // Remove old experiences and add new ones
        var oldExperiences = await _unitOfWork.ProfileExperiences.FindAsync(e => e.ProfileId == profile.Id, cancellationToken);
        _unitOfWork.ProfileExperiences.RemoveRange(oldExperiences);

        foreach (var expDto in dto.Experiences)
        {
            var experience = new ProfileExperience
            {
                ProfileId = profile.Id,
                CompanyName = expDto.CompanyName,
                Position = expDto.Position,
                Description = expDto.Description,
                StartDate = expDto.StartDate,
                EndDate = expDto.EndDate,
                IsCurrentlyWorking = expDto.IsCurrentlyWorking,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.ProfileExperiences.AddAsync(experience, cancellationToken);
        }

        // Remove old educations and add new ones
        var oldEducations = await _unitOfWork.ProfileEducations.FindAsync(e => e.ProfileId == profile.Id, cancellationToken);
        _unitOfWork.ProfileEducations.RemoveRange(oldEducations);

        foreach (var eduDto in dto.Educations)
        {
            var education = new ProfileEducation
            {
                ProfileId = profile.Id,
                InstitutionName = eduDto.InstitutionName,
                Degree = eduDto.Degree,
                FieldOfStudy = eduDto.FieldOfStudy,
                StartDate = eduDto.StartDate,
                EndDate = eduDto.EndDate,
                GPA = eduDto.GPA,
                Description = eduDto.Description,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.ProfileEducations.AddAsync(education, cancellationToken);
        }

        // Remove old certificates and add new ones
        var oldCertificates = await _unitOfWork.ProfileCertificates.FindAsync(c => c.ProfileId == profile.Id, cancellationToken);
        _unitOfWork.ProfileCertificates.RemoveRange(oldCertificates);

        foreach (var certDto in dto.Certificates)
        {
            var certificate = new ProfileCertificate
            {
                ProfileId = profile.Id,
                Name = certDto.Name,
                IssuingOrganization = certDto.IssuingOrganization,
                IssueDate = certDto.IssueDate,
                ExpiryDate = certDto.ExpiryDate,
                CredentialId = certDto.CredentialId,
                CredentialUrl = certDto.CredentialUrl,
                CertificateFileUrl = certDto.CertificateFileUrl,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.ProfileCertificates.AddAsync(certificate, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var responseDto = await MapToDtoAsync(profile, cancellationToken);

        return Result<ProfileDto>.SuccessResult(responseDto, "Profile updated successfully");
    }

    private async Task<ProfileDto> MapToDtoAsync(Profile profile, CancellationToken cancellationToken)
    {
        var skills = await _unitOfWork.ProfileSkills.FindAsync(s => s.ProfileId == profile.Id, cancellationToken);
        var experiences = await _unitOfWork.ProfileExperiences.FindAsync(e => e.ProfileId == profile.Id, cancellationToken);
        var educations = await _unitOfWork.ProfileEducations.FindAsync(e => e.ProfileId == profile.Id, cancellationToken);
        var certificates = await _unitOfWork.ProfileCertificates.FindAsync(c => c.ProfileId == profile.Id, cancellationToken);

        return new ProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            FirstName = profile.FirstName,
            LastName = profile.LastName,
            DateOfBirth = profile.DateOfBirth,
            Gender = profile.Gender,
            Address = profile.Address,
            City = profile.City,
            District = profile.District,
            StudentId = profile.StudentId,
            University = profile.University,
            Major = profile.Major,
            GPA = profile.GPA,
            YearOfStudy = profile.YearOfStudy,
            ExpectedGraduationDate = profile.ExpectedGraduationDate,
            ResumeUrl = profile.ResumeUrl,
            Bio = profile.Bio,
            LinkedInUrl = profile.LinkedInUrl,
            GitHubUrl = profile.GitHubUrl,
            Skills = skills.Select(s => new ProfileSkillDto
            {
                Id = s.Id,
                SkillName = s.SkillName,
                ProficiencyLevel = s.ProficiencyLevel,
                YearsOfExperience = s.YearsOfExperience
            }).ToList(),
            Experiences = experiences.Select(e => new ProfileExperienceDto
            {
                Id = e.Id,
                CompanyName = e.CompanyName,
                Position = e.Position,
                Description = e.Description,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                IsCurrentlyWorking = e.IsCurrentlyWorking
            }).ToList(),
            Educations = educations.Select(e => new ProfileEducationDto
            {
                Id = e.Id,
                InstitutionName = e.InstitutionName,
                Degree = e.Degree,
                FieldOfStudy = e.FieldOfStudy,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                GPA = e.GPA,
                Description = e.Description
            }).ToList(),
            Certificates = certificates.Select(c => new ProfileCertificateDto
            {
                Id = c.Id,
                Name = c.Name,
                IssuingOrganization = c.IssuingOrganization,
                IssueDate = c.IssueDate,
                ExpiryDate = c.ExpiryDate,
                CredentialId = c.CredentialId,
                CredentialUrl = c.CredentialUrl,
                CertificateFileUrl = c.CertificateFileUrl
            }).ToList()
        };
    }
}
