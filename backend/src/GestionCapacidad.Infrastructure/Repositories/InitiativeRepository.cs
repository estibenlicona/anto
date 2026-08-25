using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class InitiativeRepository(ApplicationDbContext dbContext)
    : Repository<Initiative>(dbContext), IInitiativeRepository
{
    public async Task<IReadOnlyList<Initiative>> GetBySquadAsync(
        Guid squadId,
        CancellationToken cancellationToken = default) =>
        await DbContext.Initiatives
            .Where(i => i.SquadId == squadId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

    public async Task<bool> HasActiveInitiativeAsync(
        Guid squadId,
        Guid excludeInitiativeId,
        CancellationToken cancellationToken = default) =>
        await DbContext.Initiatives.AnyAsync(
            i => i.SquadId == squadId
              && i.Id != excludeInitiativeId
              && i.Status == InitiativeStatus.Active,
            cancellationToken);
}
