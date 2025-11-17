using PTJ.Domain.Common;

namespace PTJ.Domain.Entities;

public class UserRole : BaseEntity
{
    public int UserId { get; set; }
    public int RoleId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;
}
