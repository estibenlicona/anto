using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface ISprintSnapshotRepository : IRepository<SprintSnapshot>
{
    Task<SprintSnapshot?> GetByPersonAndSprintAsync(
        Guid personId,
        Guid sprintId,
        CancellationToken cancellationToken = default);

    /// <summary>Todos los snapshots de una persona, para su propia tendencia y referencia.</summary>
    Task<IReadOnlyList<SprintSnapshot>> GetByPersonAsync(
        Guid personId,
        CancellationToken cancellationToken = default);

    /// <summary>Todos los snapshots de un conjunto de personas — la célula, para su mediana histórica.</summary>
    Task<IReadOnlyList<SprintSnapshot>> GetByPersonIdsAsync(
        IReadOnlyCollection<Guid> personIds,
        CancellationToken cancellationToken = default);
}
