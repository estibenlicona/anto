using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Estimation;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Infrastructure.Catalogs;

/// <summary>
/// Lee la versión vigente del modelo desde la base. No compone nada: el
/// contenido de una versión ya es el modelo entero, y ese es el punto del
/// cambio — antes había que armarlo de cuatro agregados que nadie garantizaba
/// coherentes entre sí.
/// </summary>
public sealed class EstimationVersionProvider(IEstimationModelRepository repository)
    : IEstimationVersionProvider
{
    public async Task<EstimationModelVersionDto?> GetCurrentAsync(
        int phaseNumber = 1,
        CancellationToken cancellationToken = default)
    {
        EstimationModel? model = await repository.GetByPhaseAsync(phaseNumber, cancellationToken);
        ModelVersion? current = model?.CurrentVersion;

        return current is null ? null : current.ToDto(model!.Id.ToString());
    }

    public async Task<EstimationModelVersionDto?> GetByIdAsync(
        Guid versionId,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<EstimationModel> models = await repository.GetAllWithContentAsync(cancellationToken);

        foreach (EstimationModel model in models)
        {
            ModelVersion? version = model.Versions.FirstOrDefault(v => v.Id == versionId);
            if (version is not null)
            {
                return version.ToDto(model.Id.ToString());
            }
        }

        return null;
    }
}
