using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface IInitiativeRepository : IRepository<Initiative>
{
    Task<IReadOnlyList<Initiative>> GetBySquadAsync(Guid squadId, CancellationToken cancellationToken = default);

    Task<bool> HasActiveInitiativeAsync(Guid squadId, Guid excludeInitiativeId, CancellationToken cancellationToken = default);
}
