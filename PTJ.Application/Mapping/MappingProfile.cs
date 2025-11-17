using AutoMapper;
using PTJ.Application.DTOs.Application;
using PTJ.Application.DTOs.Auth;
using PTJ.Application.DTOs.Company;
using PTJ.Application.DTOs.JobPost;
using PTJ.Application.DTOs.Profile;
using PTJ.Domain.Entities;

namespace PTJ.Application.Mapping;

/// <summary>
/// AutoMapper configuration for mapping between entities and DTOs
/// </summary>
public class MappingProfile : AutoMapper.Profile
{
    public MappingProfile()
    {
        // Profile mappings
        CreateMap<PTJ.Domain.Entities.Profile, ProfileDto>()
            .ForMember(dest => dest.Skills, opt => opt.MapFrom(src => src.Skills))
            .ForMember(dest => dest.Experiences, opt => opt.MapFrom(src => src.Experiences))
            .ForMember(dest => dest.Educations, opt => opt.MapFrom(src => src.Educations))
            .ForMember(dest => dest.Certificates, opt => opt.MapFrom(src => src.Certificates));

        CreateMap<ProfileSkill, ProfileSkillDto>();
        CreateMap<ProfileExperience, ProfileExperienceDto>();
        CreateMap<ProfileEducation, ProfileEducationDto>();
        CreateMap<ProfileCertificate, ProfileCertificateDto>();

        // Company mappings
        CreateMap<Company, CompanyDto>();

        CreateMap<CreateCompanyDto, Company>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.OwnerId, opt => opt.Ignore())
            .ForMember(dest => dest.Owner, opt => opt.Ignore())
            .ForMember(dest => dest.JobPosts, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore());

        // JobPost mappings
        CreateMap<JobPost, JobPostDto>()
            .ForMember(dest => dest.CompanyName, opt => opt.MapFrom(src => src.Company != null ? src.Company.Name : string.Empty))
            .ForMember(dest => dest.CompanyLogoUrl, opt => opt.MapFrom(src => src.Company != null ? src.Company.LogoUrl : string.Empty))
            .ForMember(dest => dest.Shifts, opt => opt.MapFrom(src => src.Shifts))
            .ForMember(dest => dest.RequiredSkills, opt => opt.MapFrom(src => src.RequiredSkills.Select(s => s.SkillName).ToList()));

        CreateMap<CreateJobPostDto, JobPost>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CompanyId, opt => opt.Ignore())
            .ForMember(dest => dest.Company, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.Shifts, opt => opt.Ignore())
            .ForMember(dest => dest.RequiredSkills, opt => opt.Ignore())
            .ForMember(dest => dest.Applications, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.ApplicationDeadline, opt => opt.Ignore())
            .ForMember(dest => dest.ViewCount, opt => opt.Ignore())
            .ForMember(dest => dest.ApplicationCount, opt => opt.Ignore());

        CreateMap<UpdateJobPostDto, JobPost>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CompanyId, opt => opt.Ignore())
            .ForMember(dest => dest.Company, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedByUserId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.Shifts, opt => opt.Ignore())
            .ForMember(dest => dest.RequiredSkills, opt => opt.Ignore())
            .ForMember(dest => dest.Applications, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.ApplicationDeadline, opt => opt.Ignore())
            .ForMember(dest => dest.ViewCount, opt => opt.Ignore())
            .ForMember(dest => dest.ApplicationCount, opt => opt.Ignore())
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // JobShift mappings
        CreateMap<JobShift, JobShiftDto>();
        CreateMap<CreateJobShiftDto, JobShift>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.JobPostId, opt => opt.Ignore())
            .ForMember(dest => dest.JobPost, opt => opt.Ignore());

        // Application mappings
        CreateMap<PTJ.Domain.Entities.Application, ApplicationDto>()
            .ForMember(dest => dest.JobTitle, opt => opt.MapFrom(src => src.JobPost != null ? src.JobPost.Title : string.Empty))
            .ForMember(dest => dest.ApplicantName, opt => opt.MapFrom(src =>
                src.Profile != null ? $"{src.Profile.FirstName} {src.Profile.LastName}".Trim() : string.Empty))
            .ForMember(dest => dest.StatusName, opt => opt.MapFrom(src => GetStatusName(src.StatusId)));

        CreateMap<CreateApplicationDto, PTJ.Domain.Entities.Application>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ProfileId, opt => opt.Ignore())
            .ForMember(dest => dest.Profile, opt => opt.Ignore())
            .ForMember(dest => dest.JobPost, opt => opt.Ignore())
            .ForMember(dest => dest.StatusId, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.AppliedAt, opt => opt.Ignore())
            .ForMember(dest => dest.ReviewedBy, opt => opt.Ignore())
            .ForMember(dest => dest.ReviewedAt, opt => opt.Ignore())
            .ForMember(dest => dest.ReviewNotes, opt => opt.Ignore())
            .ForMember(dest => dest.Reviewer, opt => opt.Ignore())
            .ForMember(dest => dest.History, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore());
    }

    private static string GetStatusName(int statusId)
    {
        return statusId switch
        {
            1 => "Pending",
            2 => "Reviewing",
            3 => "Accepted",
            4 => "Rejected",
            5 => "Withdrawn",
            _ => "Unknown"
        };
    }
}
