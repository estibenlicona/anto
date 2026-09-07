using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
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
        string? search = null,
        IReadOnlyCollection<string>? criticalities = null,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Squad> query = DbContext.Squads.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            string term = search.Trim().ToLower();
            query = query.Where(s => s.Name.ToLower().Contains(term) || s.Tribe.ToLower().Contains(term));
        }

        if (criticalities is { Count: > 0 })
        {
            // Un valor fuera del catálogo simplemente no matchea, igual que
            // en los filtros de personas y asignaciones.
            List<Criticality> valid = criticalities
                .Select(TryParseCriticality)
                .Where(c => c is not null)
                .Select(c => c!)
                .ToList();
            query = query.Where(s => valid.Contains(s.Criticality));
        }

        int totalCount = await query.CountAsync(cancellationToken);

        List<Squad> items = await query
            .OrderBy(s => s.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    private static Criticality? TryParseCriticality(string value)
    {
        try
        {
            return Criticality.From(value);
        }
        catch (DomainException)
        {
            return null;
        }
    }
}
