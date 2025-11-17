using PTJ.Domain.Common;

namespace PTJ.Domain.Entities;

public class JobPostSkill : BaseEntity
{
    public int JobPostId { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public int? RequiredLevel { get; set; } // 1-5
    public bool IsRequired { get; set; } = true;

    // Navigation properties
    public virtual JobPost JobPost { get; set; } = null!;
}
