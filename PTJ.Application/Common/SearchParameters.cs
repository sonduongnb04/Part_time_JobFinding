namespace PTJ.Application.Common;

public class SearchParameters
{
    public string? SearchTerm { get; set; }
    public string? Location { get; set; }
    public string? Category { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}
