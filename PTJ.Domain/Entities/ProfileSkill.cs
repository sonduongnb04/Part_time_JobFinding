using PTJ.Domain.Common;

namespace PTJ.Domain.Entities;

public class ProfileSkill : BaseEntity
{
    public int ProfileId { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public int? ProficiencyLevel { get; set; } // 1-5
    public int? YearsOfExperience { get; set; }

    // Navigation properties
    public virtual Profile Profile { get; set; } = null!;
}
