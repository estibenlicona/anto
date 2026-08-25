using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class BauTaskRepository(ApplicationDbContext dbContext)
    : Repository<BauTask>(dbContext), IBauTaskRepository
{
    public async Task<IReadOnlyList<BauTask>> GetBySquadAsync(
        Guid squadId,
        CancellationToken cancellationToken = default) =>
        await DbContext.BauTasks
            .Where(t => t.SquadId == squadId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

    public async Task<bool> ExistsByNameInSquadAsync(
        Guid squadId,
        string name,
        CancellationToken cancellationToken = default) =>
        await DbContext.BauTasks.AnyAsync(
            t => t.SquadId == squadId && t.Name == name,
            cancellationToken);
}
