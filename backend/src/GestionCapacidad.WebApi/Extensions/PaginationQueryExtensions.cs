namespace GestionCapacidad.WebApi.Extensions;

/// <summary>
/// Clamps raw page/pageSize query values to a safe range instead of rejecting
/// them with a 400 - see design.md (add-pagination-and-row-actions-menu) for why.
/// </summary>
public static class PaginationQueryExtensions
{
    private const int MinPageSize = 1;
    private const int MaxPageSize = 100;

    public static (int Page, int PageSize) ClampPagination(int page, int pageSize) =>
        (Math.Max(1, page), Math.Clamp(pageSize, MinPageSize, MaxPageSize));
}
