using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

public class Repository<T>(ApplicationDbContext dbContext) : IRepository<T>
    where T : Entity
{
    protected readonly ApplicationDbContext DbContext = dbContext;
    protected readonly DbSet<T> DbSet = dbContext.Set<T>();

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet.FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(entity, cancellationToken);
    }

    public void Update(T entity)
    {
        DbSet.Update(entity);
    }

    public void Delete(T entity)
    {
        DbSet.Remove(entity);
    }
}
