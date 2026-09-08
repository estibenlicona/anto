using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class TeamRepository(ApplicationDbContext dbContext)
    : Repository<Team>(dbContext), ITeamRepository
{
    public async Task<bool> ExistsByNameAsync(
        string name,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        return await DbContext.Teams.AnyAsync(
            t => t.Name == name && (excludeId == null || t.Id != excludeId),
            cancellationToken);
    }

    public async Task<(IReadOnlyList<Team> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Team> query = DbContext.Teams.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            string term = search.Trim().ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(term));
        }

        int totalCount = await query.CountAsync(cancellationToken);

        List<Team> items = await query
            .OrderBy(t => t.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
