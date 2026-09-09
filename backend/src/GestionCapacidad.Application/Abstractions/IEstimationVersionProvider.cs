using GestionCapacidad.Application.Estimation;

namespace GestionCapacidad.Application.Abstractions;

/// <summary>
/// Sirve la versión vigente del modelo de una fase. Es lo único que el motor
/// necesita saber para calcular, y lo que la pantalla de evaluación lee para
/// dibujar el cuestionario.
///
/// Publicar una versión cambia lo que devuelve; guardar un borrador no. Esa
/// diferencia es la razón de ser del cambio: mientras se edita, lo que se
/// estima no se mueve.
/// </summary>
public interface IEstimationVersionProvider
{
    /// <summary>La versión vigente de la fase, o <c>null</c> si esa fase no tiene ninguna.</summary>
    Task<EstimationModelVersionDto?> GetCurrentAsync(
        int phaseNumber = 1,
        CancellationToken cancellationToken = default);

    /// <summary>Una versión concreta, para leer una estimación contra la que la calculó.</summary>
    Task<EstimationModelVersionDto?> GetByIdAsync(
        Guid versionId,
        CancellationToken cancellationToken = default);
}
