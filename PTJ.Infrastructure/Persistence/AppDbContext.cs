using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using PTJ.Domain.Common;
using PTJ.Domain.Entities;

namespace PTJ.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.ConfigureWarnings(warnings =>
            warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
    }

    // Auth
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Companies
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanyRegistrationRequest> CompanyRegistrationRequests => Set<CompanyRegistrationRequest>();

    // Profiles
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<ProfileSkill> ProfileSkills => Set<ProfileSkill>();
    public DbSet<ProfileExperience> ProfileExperiences => Set<ProfileExperience>();
    public DbSet<ProfileEducation> ProfileEducations => Set<ProfileEducation>();
    public DbSet<ProfileCertificate> ProfileCertificates => Set<ProfileCertificate>();

    // Jobs
    public DbSet<JobPost> JobPosts => Set<JobPost>();
    public DbSet<JobShift> JobShifts => Set<JobShift>();
    public DbSet<JobPostSkill> JobPostSkills => Set<JobPostSkill>();

    // Applications
    public DbSet<Domain.Entities.Application> Applications => Set<Domain.Entities.Application>();
    public DbSet<ApplicationHistory> ApplicationHistories => Set<ApplicationHistory>();
    public DbSet<ApplicationStatusLookup> ApplicationStatuses => Set<ApplicationStatusLookup>();

    // Files
    public DbSet<FileEntity> Files => Set<FileEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Configure RowVersion for all BaseEntity
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property<byte[]>("RowVersion")
                    .IsRowVersion()
                    .HasColumnName("RowVersion");
            }
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.IsDeleted = false;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        foreach (var entry in ChangeTracker.Entries<BaseAuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedAt = DateTime.UtcNow;
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
