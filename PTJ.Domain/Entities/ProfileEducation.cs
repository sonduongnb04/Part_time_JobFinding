using PTJ.Domain.Common;

namespace PTJ.Domain.Entities;

public class ProfileEducation : BaseEntity
{
    public int ProfileId { get; set; }
    public string InstitutionName { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string? FieldOfStudy { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? GPA { get; set; }
    public string? Description { get; set; }

    // Navigation properties
    public virtual Profile Profile { get; set; } = null!;
}
