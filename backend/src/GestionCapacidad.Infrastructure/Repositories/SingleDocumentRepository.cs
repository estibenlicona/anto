using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.Infrastructure.Repositories;

/// <summary>
/// Los agregados de los que existe a lo sumo una fila. Uno solo sirve a los
/// cuatro parámetros del modelo: la consulta es la misma —la primera fila que
/// haya— y sólo cambia el tipo.
///
/// La lectura va con tracking, al contrario que <see cref="Repository{T}"/>:
/// lo que se lee acá es justamente lo que el use case va a reemplazar, y sin
/// tracking los cambios en las colecciones poseídas no llegarían a la base.
/// </summary>
public sealed class SingleDocumentRepository<T>(ApplicationDbContext dbContext) : ISingleDocumentRepository<T>
    where T : AggregateRoot
{
    private readonly DbSet<T> _dbSet = dbContext.Set<T>();

    public async Task<T?> GetAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
    }

    public void Update(T entity)
    {
        _dbSet.Update(entity);
    }
}
