using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class AllocationRepository(ApplicationDbContext dbContext)
    : Repository<Allocation>(dbContext), IAllocationRepository
{
    public async Task<IReadOnlyList<Allocation>> GetBySquadAsync(
        Guid squadId, CancellationToken cancellationToken = default) =>
        await DbContext.Allocations
            .Where(a => a.SquadId == squadId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Allocation>> GetByPersonAsync(
        Guid personId, CancellationToken cancellationToken = default) =>
        await DbContext.Allocations
            .Where(a => a.PersonId == personId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

    public async Task<bool> ExistsByPersonAndSquadAsync(
        Guid personId, Guid squadId, CancellationToken cancellationToken = default) =>
        await DbContext.Allocations.AnyAsync(
            a => a.PersonId == personId && a.SquadId == squadId, cancellationToken);

    public async Task<int> GetTotalDedicationForPersonAsync(
        Guid personId, Guid excludeAllocationId, CancellationToken cancellationToken = default) =>
        await DbContext.Allocations
            .Where(a => a.PersonId == personId && a.Id != excludeAllocationId)
            .SumAsync(a => a.DedicationPercentage.Value, cancellationToken);

    // Joined (not fetch-all-then-sort-in-memory) so the order-by-name that the
    // paginated page needs happens inside the same query as Skip/Take — see
    // design.md (add-pagination-and-row-actions-menu), Decisions.
    public async Task<(IReadOnlyList<(Allocation Allocation, string PersonName)> Items, int TotalCount)> GetBySquadPagedAsync(
        Guid squadId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var joined = DbContext.Allocations
            .Where(a => a.SquadId == squadId)
            .Join(
                DbContext.People,
                allocation => allocation.PersonId,
                person => person.Id,
                (allocation, person) => new { Allocation = allocation, PersonName = person.Name });

        int totalCount = await joined.CountAsync(cancellationToken);

        var pageResults = await joined
            .AsNoTracking()
            .OrderBy(x => x.PersonName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = pageResults.Select(x => (x.Allocation, x.PersonName)).ToList();
        return (items, totalCount);
    }
}
