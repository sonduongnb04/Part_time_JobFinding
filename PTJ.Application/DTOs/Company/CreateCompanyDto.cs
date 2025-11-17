namespace PTJ.Application.DTOs.Company;

public class CreateCompanyDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? Website { get; set; }
    public string? TaxCode { get; set; }
    public string? Industry { get; set; }
    public int? EmployeeCount { get; set; }
    public DateTime? FoundedYear { get; set; }
}
