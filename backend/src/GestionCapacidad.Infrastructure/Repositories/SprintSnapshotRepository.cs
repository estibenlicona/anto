using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class SprintSnapshotRepository(ApplicationDbContext dbContext)
    : Repository<SprintSnapshot>(dbContext), ISprintSnapshotRepository
{
    public async Task<SprintSnapshot?> GetByPersonAndSprintAsync(
        Guid personId,
        Guid sprintId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet.FirstOrDefaultAsync(
            s => s.PersonId == personId && s.SprintId == sprintId, cancellationToken);
    }

    public async Task<IReadOnlyList<SprintSnapshot>> GetByPersonAsync(
        Guid personId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking().Where(s => s.PersonId == personId).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SprintSnapshot>> GetByPersonIdsAsync(
        IReadOnlyCollection<Guid> personIds,
        CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking().Where(s => personIds.Contains(s.PersonId)).ToListAsync(cancellationToken);
    }
}
