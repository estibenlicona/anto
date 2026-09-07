using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public sealed class SprintRepository(ApplicationDbContext dbContext)
    : Repository<Sprint>(dbContext), ISprintRepository
{
    public override async Task<IReadOnlyList<Sprint>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking().OrderBy(s => s.StartDate).ToListAsync(cancellationToken);
    }

    public async Task<Sprint?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await DbSet.FirstOrDefaultAsync(s => s.Name == name, cancellationToken);
    }
}
