using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
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

    public async Task<bool> ExistsByPersonAsync(
        Guid personId, CancellationToken cancellationToken = default) =>
        await DbContext.Allocations.AnyAsync(a => a.PersonId == personId, cancellationToken);

    // Joined (not fetch-all-then-sort-in-memory) so the filters and the
    // order-by-name that the paginated page needs happen inside the same query
    // as Skip/Take. Devuelve la persona completa: la fila del equipo muestra
    // cargo, modalidad, nivel y margen, y filtra por nombre/cargo y nivel.
    public async Task<(IReadOnlyList<(Allocation Allocation, Person Person)> Items, int TotalCount)> GetBySquadPagedAsync(
        Guid squadId,
        int page,
        int pageSize,
        string? search = null,
        IReadOnlyCollection<int>? levels = null,
        CancellationToken cancellationToken = default)
    {
        var joined = DbContext.Allocations
            .Where(a => a.SquadId == squadId)
            .Join(
                DbContext.People,
                allocation => allocation.PersonId,
                person => person.Id,
                (allocation, person) => new { Allocation = allocation, Person = person });

        if (!string.IsNullOrWhiteSpace(search))
        {
            string term = search.Trim().ToLower();
            joined = joined.Where(x =>
                x.Person.Name.ToLower().Contains(term) || x.Person.Position.ToLower().Contains(term));
        }

        if (levels is { Count: > 0 })
        {
            // Un valor fuera del catálogo simplemente no matchea, igual que en
            // los filtros del maestro de personas.
            List<Level> validLevels = levels
                .Select(TryParseLevel)
                .Where(l => l is not null)
                .Select(l => l!)
                .ToList();
            joined = joined.Where(x => validLevels.Contains(x.Person.Level));
        }

        int totalCount = await joined.CountAsync(cancellationToken);

        var pageResults = await joined
            .AsNoTracking()
            .OrderBy(x => x.Person.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = pageResults.Select(x => (x.Allocation, x.Person)).ToList();
        return (items, totalCount);
    }

    private static Level? TryParseLevel(int value)
    {
        try
        {
            return Level.From(value);
        }
        catch (DomainException)
        {
            return null;
        }
    }
}
