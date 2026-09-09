using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Domain.Interfaces;

public interface IEstimationModelRepository : IRepository<EstimationModel>
{
    /// <summary>
    /// Todos los modelos con sus versiones y todo su contenido cargado. El
    /// contenido es el agregado: cargarlo a medias deja una versión que se
    /// puede leer pero no calcular, y nada distingue una de la otra.
    /// </summary>
    Task<IReadOnlyList<EstimationModel>> GetAllWithContentAsync(
        CancellationToken cancellationToken = default);

    Task<EstimationModel?> GetWithContentAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>El modelo de una fase, o <c>null</c> si esa fase no tiene modelo.</summary>
    Task<EstimationModel?> GetByPhaseAsync(int phaseNumber, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cuántas estimaciones calculó cada versión, por id de versión. Es lo que
    /// convierte una fila de la lista en una decisión: una versión que ya
    /// calculó no se toca.
    /// </summary>
    Task<IReadOnlyDictionary<Guid, int>> CountEstimationsByVersionAsync(
        CancellationToken cancellationToken = default);
}
