using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure;

public sealed class UnitOfWork(ApplicationDbContext dbContext) : IUnitOfWork
{
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.SaveChangesAsync(cancellationToken);
    }
}
