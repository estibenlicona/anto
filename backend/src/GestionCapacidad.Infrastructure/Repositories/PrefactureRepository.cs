using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class PrefactureRepository(ApplicationDbContext dbContext)
    : Repository<Prefacture>(dbContext), IPrefactureRepository
{
    public async Task<Prefacture?> GetByPersonAndPeriodAsync(
        Guid personId,
        string period,
        CancellationToken cancellationToken = default) =>
        await DbContext.Prefactures
            .FirstOrDefaultAsync(p => p.PersonId == personId && p.Period == period, cancellationToken);

    public async Task<IReadOnlyList<Prefacture>> GetByPeriodAsync(
        string period,
        CancellationToken cancellationToken = default) =>
        await DbContext.Prefactures
            .Where(p => p.Period == period)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
}
