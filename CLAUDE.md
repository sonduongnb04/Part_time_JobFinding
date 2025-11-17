# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Part-Time Job Finding Platform** REST API built with **.NET 9.0** using **Clean Architecture** principles. The solution is structured into four projects following Domain-Driven Design:

- **PTJ.Domain**: Core domain entities, interfaces, and business logic
- **PTJ.Application**: Application services, DTOs, and mapping profiles
- **PTJ.Infrastructure**: Data access (EF Core), repositories, and external services
- **PTJ.API**: Web API controllers, middleware, and configuration

## Architecture Patterns

### Clean Architecture Layers

The project strictly follows dependency rules:
- **PTJ.API** → depends on Application, Infrastructure, Domain
- **PTJ.Infrastructure** → depends on Application, Domain
- **PTJ.Application** → depends on Domain only
- **PTJ.Domain** → no dependencies (pure business logic)

### Repository Pattern & Unit of Work

All data access goes through the **Unit of Work** pattern:
- `IRepository<T>` provides generic CRUD operations for all entities
- `IUnitOfWork` exposes typed repositories and manages transactions
- Implementation is in `PTJ.Infrastructure/Repositories/GenericRepository.cs` and `UnitOfWork.cs`

Example usage in services:
```csharp
var user = await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Email == email);
await _unitOfWork.SaveChangesAsync();
```

### Base Entities

All entities inherit from `BaseEntity` (in `PTJ.Domain/Common/BaseEntity.cs`) which provides:
- `Id` (int, primary key)
- `CreatedAt`, `UpdatedAt` (automatic timestamps)
- `IsDeleted` (soft delete flag)
- `RowVersion` (concurrency token)

The `AppDbContext.SaveChangesAsync()` automatically sets these values. Soft deletes are implemented - entities are never physically removed.

### Result Pattern

All service methods return `Result` or `Result<T>` (defined in `PTJ.Application/Common/Result.cs`):
```csharp
public class Result<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; }
}
```

This provides consistent error handling across the API.

### Authentication & Authorization

- **JWT Bearer authentication** with access tokens (60 min) and refresh tokens (7 days)
- Configuration in `appsettings.json` under `"Jwt"` section
- `IJwtService` generates tokens, `IAuthService` handles login/register/refresh
- Role-based authorization: Users have roles (ADMIN, EMPLOYER, STUDENT) via `UserRole` join table
- Custom filter `AuthorizeCompanyOwnerFilter` ensures companies can only modify their own data

### User Registration & Role Assignment Workflow

**CRITICAL**: Follow this workflow when working with user registration and company creation:

1. **New User Registration** (`POST /api/auth/register`):
   - All new users are automatically assigned the **STUDENT** role (AuthService.cs:38-48)
   - A `Profile` entity is automatically created for every new user
   - Users start with STUDENT role only

2. **Company Registration Request** (`POST /api/Companies`):
   - Any authenticated user can submit a company registration request
   - Request is stored in `CompanyRegistrationRequests` table with status `Pending`
   - **NO Company entity is created** at this stage
   - **NO EMPLOYER role is assigned** at this stage
   - User must wait for admin approval

3. **Admin Approval Process** (`POST /api/CompanyRequests/approve`):
   - Only users with ADMIN role can approve requests
   - When approved (CompanyService.cs:214-265):
     - `Company` entity is created and linked to the user
     - `CompanyRegistrationRequest` status updated to `Approved`
     - **EMPLOYER role is assigned** to the user (lines 252-263)
     - User now has both STUDENT and EMPLOYER roles
   - If rejected, request status is set to `Rejected` with rejection reason

4. **Multi-Role Support**:
   - Users can have multiple roles simultaneously (via UserRole join table)
   - A user with EMPLOYER role still retains their STUDENT role
   - Roles are seeded in database: ADMIN (id=1), EMPLOYER (id=2), STUDENT (id=3)

## Common Development Commands

### Build and Run
```bash
# Clean solution
dotnet clean

# Build solution
dotnet build

# Run the API (from solution root)
dotnet run --project PTJ.API

# Run with specific configuration
dotnet run --project PTJ.API --configuration Release
```

### Database Migrations
```bash
# Add new migration (run from solution root)
dotnet ef migrations add <MigrationName> --project PTJ.Infrastructure --startup-project PTJ.API

# Update database
dotnet ef database update --project PTJ.Infrastructure --startup-project PTJ.API

# Remove last migration
dotnet ef migrations remove --project PTJ.Infrastructure --startup-project PTJ.API

# Generate SQL script
dotnet ef migrations script --project PTJ.Infrastructure --startup-project PTJ.API
```

### Package Management
```bash
# Add package to specific project
dotnet add PTJ.API package <PackageName>

# Remove package
dotnet remove PTJ.API package <PackageName>

# Restore packages
dotnet restore
```

## Database Configuration

- **SQL Server** via Entity Framework Core 9.0
- Connection string in `appsettings.json` under `"ConnectionStrings:Default"`
- Default: `Server=localhost;Database=PartTimeJobs;Trusted_Connection=True;TrustServerCertificate=True`
- Entity configurations use Fluent API in `PTJ.Infrastructure/Configurations/`
- `AppDbContext` applies all configurations via `ApplyConfigurationsFromAssembly`

## Key Domain Entities

### Authentication
- `User` - base user entity (Email, PasswordHash, FullName, etc.)
- `Role` - user roles (Student, Company, Admin)
- `UserRole` - many-to-many join table
- `RefreshToken` - stores refresh tokens for JWT authentication

### Company & Jobs
- `Company` - company profiles (created only after admin approval, linked to User with EMPLOYER role)
- `CompanyRegistrationRequest` - pending company registration requests (status: Pending/Approved/Rejected)
- `JobPost` - job postings with title, description, salary, location
- `JobShift` - work shifts for a job (start/end time, day of week)
- `JobPostSkill` - required skills for a job

### Student Profiles
- `Profile` - student profile (linked to User with role "Student")
- `ProfileSkill`, `ProfileExperience`, `ProfileEducation`, `ProfileCertificate` - profile details

### Applications
- `Application` - job applications from students
- `ApplicationHistory` - tracks status changes
- `ApplicationStatusLookup` - reference table for statuses (Pending, Accepted, Rejected, etc.)

## Service Layer Structure

Each major feature has an interface in `PTJ.Application/Services/` and implementation in `PTJ.Infrastructure/Services/`:

- `IAuthService` / `AuthService` - Authentication (login, register, refresh tokens)
- `IJobPostService` / `JobPostService` - Job posting management
- `ICompanyService` / `CompanyService` - Company profile and registration requests
- `IProfileService` / `ProfileService` - Student profile management
- `IApplicationService` / `ApplicationService` - Job application workflow
- `IFileStorageService` / `LocalFileStorageService` - File uploads (resumes, certificates)
- `ISearchService` / `SearchService` - Search functionality

All services use `IUnitOfWork` for data access and return `Result<T>` objects.

## API Controllers

Controllers in `PTJ.API/Controllers/`:
- `AuthController` - POST /api/auth/login, /register, /refresh
- `JobPostsController` - CRUD for job posts
- `CompaniesController` - Company profile management
- `CompanyRequestsController` - Admin approval of company registrations
- `ProfilesController` - Student profile management
- `ApplicationsController` - Job application submission and tracking
- `FilesController` - File upload/download

## Middleware & Filters

- `GlobalExceptionMiddleware` - Catches all unhandled exceptions and returns standardized JSON responses
- `ValidationFilter` - Global validation filter (registered in Program.cs)
- `AuthorizeCompanyOwnerFilter` - Custom authorization for company-owned resources

## AutoMapper

- Mapping profiles defined in `PTJ.Application/Mapping/MappingProfile.cs`
- Maps between entities and DTOs (e.g., `User` ↔ `RegisterDto`, `JobPost` ↔ `JobPostDto`)
- Registered in DI: `builder.Services.AddAutoMapper(typeof(MappingProfile))`

## File Storage

- Local file storage configured in `appsettings.json` under `"FileStorage"`
- Default upload path: `Uploads/`
- Max file size: 10MB (10485760 bytes)
- Allowed extensions: .jpg, .jpeg, .png, .pdf, .doc, .docx
- Files are tracked in `FileEntity` table with metadata

## CORS & Swagger

- CORS policy "AllowAll" allows all origins (configured for development)
- Swagger UI available at `/swagger` in development mode
- JWT Bearer authentication configured in Swagger for testing

## Important Notes

- All timestamps use **UTC** (`DateTime.UtcNow`)
- Password hashing uses **BCrypt** (via BCrypt.Net-Next package)
- Concurrency conflicts handled via `RowVersion` (optimistic concurrency)
- Soft deletes are enforced - check `IsDeleted` flag in queries
- The `AppDbContext` automatically handles soft deletes in `SaveChangesAsync`
