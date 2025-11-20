namespace PTJ.Domain.Common;

/// <summary>
/// Constants for role names used throughout the application
/// </summary>
public static class RoleConstants
{
    public const string Admin = "ADMIN";
    public const string Employer = "EMPLOYER";
    public const string Student = "STUDENT";

    // Combined roles for authorization
    public const string EmployerOrAdmin = "EMPLOYER,ADMIN";
    public const string StudentOrAdmin = "STUDENT,ADMIN";
}
