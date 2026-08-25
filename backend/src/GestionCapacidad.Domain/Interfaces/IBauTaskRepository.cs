using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface IBauTaskRepository : IRepository<BauTask>
{
    Task<IReadOnlyList<BauTask>> GetBySquadAsync(Guid squadId, CancellationToken cancellationToken = default);

    Task<bool> ExistsByNameInSquadAsync(Guid squadId, string name, CancellationToken cancellationToken = default);
}
