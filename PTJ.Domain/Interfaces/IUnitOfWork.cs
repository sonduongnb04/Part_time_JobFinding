using PTJ.Domain.Entities;

namespace PTJ.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    // Auth
    IRepository<User> Users { get; }
    IRepository<Role> Roles { get; }
    IRepository<UserRole> UserRoles { get; }
    IRepository<RefreshToken> RefreshTokens { get; }

    // Companies
    IRepository<Company> Companies { get; }
    IRepository<CompanyRegistrationRequest> CompanyRegistrationRequests { get; }

    // Profiles
    IRepository<Profile> Profiles { get; }
    IRepository<ProfileSkill> ProfileSkills { get; }
    IRepository<ProfileExperience> ProfileExperiences { get; }
    IRepository<ProfileEducation> ProfileEducations { get; }
    IRepository<ProfileCertificate> ProfileCertificates { get; }

    // Jobs
    IRepository<JobPost> JobPosts { get; }
    IRepository<JobShift> JobShifts { get; }
    IRepository<JobPostSkill> JobPostSkills { get; }

    // Applications
    IRepository<Application> Applications { get; }
    IRepository<ApplicationHistory> ApplicationHistories { get; }
    IRepository<ApplicationStatusLookup> ApplicationStatuses { get; }

    // Files
    IRepository<FileEntity> Files { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
