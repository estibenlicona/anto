using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class PlanActionRepository(ApplicationDbContext dbContext)
    : Repository<PlanAction>(dbContext), IPlanActionRepository
{
    public async Task<IReadOnlyList<PlanAction>> GetByPersonAsync(Guid personId, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking().Where(a => a.PersonId == personId).ToListAsync(cancellationToken);
    }
}
