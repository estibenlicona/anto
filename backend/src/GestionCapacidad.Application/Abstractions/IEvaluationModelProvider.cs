using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.Abstractions;

/// <summary>
/// Sirve el modelo de evaluación vigente. Se resuelve en cada petición y no
/// se cachea: los parámetros son editables desde Admin y un cambio guardado
/// allá debe alcanzar a la siguiente evaluación.
/// </summary>
public interface IEvaluationModelProvider
{
    Task<EvaluationModelDto> GetAsync(CancellationToken cancellationToken = default);
}
