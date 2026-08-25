using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class SquadRepository(ApplicationDbContext dbContext)
    : Repository<Squad>(dbContext), ISquadRepository
{
    public async Task<bool> ExistsByNameAsync(
        string name,
        CancellationToken cancellationToken = default)
    {
        return await DbContext.Squads.AnyAsync(
            s => s.Name == name,
            cancellationToken);
    }

    public async Task<(IReadOnlyList<Squad> Items, int TotalCount)> GetPagedAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        int totalCount = await DbContext.Squads.CountAsync(cancellationToken);

        List<Squad> items = await DbContext.Squads
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
