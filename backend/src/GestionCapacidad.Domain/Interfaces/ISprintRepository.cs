using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

/// <summary><see cref="IRepository{T}.GetAllAsync"/> devuelve los sprints ordenados por fecha de inicio ascendente.</summary>
public interface ISprintRepository : IRepository<Sprint>
{
    Task<Sprint?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}
