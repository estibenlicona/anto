using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Estimation;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Estimation;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Admin;

/// <summary>Identifica una versión: el modelo y su número.</summary>
public sealed record ModelVersionQuery(Guid ModelId, int VersionNumber);

// ── Lectura ──────────────────────────────────────────────────────────────────

public sealed record GetEstimationModelsResponse(IReadOnlyList<EstimationModelListItemDto> Models);

/// <summary>
/// Los modelos con sus versiones, de la más nueva a la más vieja, y cuántas
/// estimaciones calculó cada una — que es lo que decide si la fila ofrece
/// seguir editando o crear una versión nueva.
/// </summary>
public sealed class GetEstimationModelsUseCase(IEstimationModelRepository repository)
    : IUseCase<GetEstimationModelsResponse>
{
    public async Task<GetEstimationModelsResponse> ExecuteAsync(
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<EstimationModel> models = await repository.GetAllWithContentAsync(cancellationToken);
        IReadOnlyDictionary<Guid, int> counts =
            await repository.CountEstimationsByVersionAsync(cancellationToken);

        return new GetEstimationModelsResponse(
        [
            .. models.Select(model => new EstimationModelListItemDto(
                model.Id.ToString(),
                model.Name,
                model.Phase.Value,
                [
                    .. model.Versions
                        .OrderByDescending(v => v.Number)
                        .Select(v => new ModelVersionListItemDto(
                            v.Id.ToString(),
                            v.Number,
                            v.Status.Value,
                            v.EffectiveFrom,
                            v.EffectiveTo,
                            v.ChangeNote,
                            counts.GetValueOrDefault(v.Id, 0))),
                ])),
        ]);
    }
}

public sealed record GetModelVersionContentResponse(EstimationModelVersionDto Version, string Status);

public sealed class GetModelVersionContentUseCase(IEstimationModelRepository repository)
    : IUseCase<ModelVersionQuery, GetModelVersionContentResponse>
{
    public async Task<GetModelVersionContentResponse> ExecuteAsync(
        ModelVersionQuery request,
        CancellationToken cancellationToken = default)
    {
        (EstimationModel model, ModelVersion version) =
            await EstimationModelLookup.FindAsync(repository, request, cancellationToken);

        return new GetModelVersionContentResponse(
            version.ToDto(model.Id.ToString()),
            version.Status.Value);
    }
}

public sealed record GetModelVersionValidationResponse(ModelValidationReportDto Report);

public sealed class GetModelVersionValidationUseCase(IEstimationModelRepository repository)
    : IUseCase<ModelVersionQuery, GetModelVersionValidationResponse>
{
    public async Task<GetModelVersionValidationResponse> ExecuteAsync(
        ModelVersionQuery request,
        CancellationToken cancellationToken = default)
    {
        (_, ModelVersion version) =
            await EstimationModelLookup.FindAsync(repository, request, cancellationToken);

        return new GetModelVersionValidationResponse(
            EstimationModelLookup.ToDto(ModelVersionValidation.Validate(version)));
    }
}

public sealed record GetModelVersionDiffResponse(ModelVersionDiffDto Diff);

/// <summary>
/// En qué difiere una versión de la que rige. Se compara contra la vigente y no
/// contra la de origen porque lo que importa antes de publicar es qué va a
/// cambiar para quien estime mañana.
/// </summary>
public sealed class GetModelVersionDiffUseCase(IEstimationModelRepository repository)
    : IUseCase<ModelVersionQuery, GetModelVersionDiffResponse>
{
    public async Task<GetModelVersionDiffResponse> ExecuteAsync(
        ModelVersionQuery request,
        CancellationToken cancellationToken = default)
    {
        (EstimationModel model, ModelVersion version) =
            await EstimationModelLookup.FindAsync(repository, request, cancellationToken);

        ModelVersion? current = model.CurrentVersion;
        if (current is not null && current.Number == version.Number)
        {
            current = null;
        }

        IReadOnlyList<ModelDiffEntry> entries = ModelVersionDiff.Between(current, version);

        return new GetModelVersionDiffResponse(new ModelVersionDiffDto(
            current?.Number,
            version.Number,
            [
                .. entries.Select(e => new ModelVersionDiffEntryDto(
                    e.Section,
                    e.Item,
                    e.Kind switch
                    {
                        ModelDiffKind.Added => "agregado",
                        ModelDiffKind.Removed => "quitado",
                        _ => "cambiado",
                    },
                    e.Before,
                    e.After)),
            ]));
    }
}

public sealed record GetModelVersionHistoryResponse(IReadOnlyList<ModelChangeEntryDto> Entries);

public sealed class GetModelVersionHistoryUseCase(IEstimationModelRepository repository)
    : IUseCase<ModelVersionQuery, GetModelVersionHistoryResponse>
{
    public async Task<GetModelVersionHistoryResponse> ExecuteAsync(
        ModelVersionQuery request,
        CancellationToken cancellationToken = default)
    {
        (_, ModelVersion version) =
            await EstimationModelLookup.FindAsync(repository, request, cancellationToken);

        // De la más nueva a la más vieja: quien abre el historial quiere saber
        // qué pasó recién.
        return new GetModelVersionHistoryResponse(
        [
            .. version.History
                .OrderByDescending(e => e.OccurredAtUtc)
                .Select(e => new ModelChangeEntryDto(e.OccurredAtUtc, e.Author, e.Section, e.Summary)),
        ]);
    }
}

/// <summary>Lo que comparten todos los casos de uso: encontrar la versión y traducir la validación.</summary>
internal static class EstimationModelLookup
{
    internal static async Task<(EstimationModel Model, ModelVersion Version)> FindAsync(
        IEstimationModelRepository repository,
        ModelVersionQuery query,
        CancellationToken cancellationToken)
    {
        EstimationModel model = await repository.GetWithContentAsync(query.ModelId, cancellationToken)
            ?? throw new NotFoundException($"No existe el modelo {query.ModelId}.");

        ModelVersion? version = model.Versions.FirstOrDefault(v => v.Number == query.VersionNumber);

        return version is null
            ? throw new NotFoundException(
                $"El modelo {model.Name} no tiene la versión {query.VersionNumber}.")
            : (model, version);
    }

    internal static ModelValidationReportDto ToDto(ModelValidationReport report) => new(
        [
            .. report.Checks.Select(c => new ModelValidationCheckDto(
                c.Code,
                c.Title,
                c.Status switch
                {
                    ModelCheckStatus.Failed => "impedimento",
                    ModelCheckStatus.Warning => "advertencia",
                    _ => "pasa",
                },
                c.Missing,
                c.Section)),
        ],
        report.Impediments.Count,
        report.Warnings.Count,
        report.CanPublish);
}
