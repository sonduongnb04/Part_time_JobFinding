using PTJ.Application.Common;

namespace PTJ.Application.Services;

public interface ISearchService
{
    Task<Result<PaginatedList<T>>> SearchAsync<T>(
        IQueryable<T> query,
        string? searchTerm,
        Func<IQueryable<T>, string, IQueryable<T>> searchExpression,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default) where T : class;
}
