using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface IPlanActionRepository : IRepository<PlanAction>
{
    /// <summary>Todas las acciones de una persona, para armar su plan.</summary>
    Task<IReadOnlyList<PlanAction>> GetByPersonAsync(Guid personId, CancellationToken cancellationToken = default);
}
