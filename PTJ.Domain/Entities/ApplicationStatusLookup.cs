using PTJ.Domain.Common;

namespace PTJ.Domain.Entities;

public class ApplicationStatusLookup : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }

    // Navigation properties
    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();
}
