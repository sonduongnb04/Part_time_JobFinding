using Microsoft.EntityFrameworkCore;
using PTJ.Application.Common;
using PTJ.Application.Services;

namespace PTJ.Infrastructure.Services;

public class SearchService : ISearchService
{
    public async Task<Result<PaginatedList<T>>> SearchAsync<T>(
        IQueryable<T> query,
        string? searchTerm,
        Func<IQueryable<T>, string, IQueryable<T>> searchExpression,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default) where T : class
    {
        try
        {
            // Apply search filter if provided
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = searchExpression(query, searchTerm);
            }

            // Get total count
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var result = new PaginatedList<T>(items, totalCount, pageNumber, pageSize);

            return Result<PaginatedList<T>>.SuccessResult(result);
        }
        catch (Exception ex)
        {
            return Result<PaginatedList<T>>.FailureResult($"Search failed: {ex.Message}");
        }
    }
}
