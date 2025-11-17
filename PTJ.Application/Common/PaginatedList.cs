namespace PTJ.Application.Common;

public class PaginatedList<T>
{
    public List<T> Items { get; set; } = new();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PaginatedList()
    {
    }

    public PaginatedList(List<T> items, int count, int pageNumber, int pageSize)
    {
        Items = items;
        TotalCount = count;
        PageNumber = pageNumber;
        PageSize = pageSize;
    }

    public static PaginatedList<T> Create(IEnumerable<T> source, int pageNumber, int pageSize)
    {
        var items = source as List<T> ?? source.ToList();
        var count = items.Count;
        var paginatedItems = items.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
        return new PaginatedList<T>(paginatedItems, count, pageNumber, pageSize);
    }
}
