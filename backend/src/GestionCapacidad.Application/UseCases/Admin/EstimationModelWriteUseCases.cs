using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Estimation;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Admin;

/// <summary>
/// Lo común a toda escritura sobre una versión: exigir el autor, encontrar la
/// versión y negarse si no es un borrador.
///
/// El 409 se decide acá y no en el dominio para que el cliente reciba el código
/// que corresponde a "esto no se puede en este estado" en vez de un error
/// genérico; el dominio igual se niega por su cuenta, y ese es el que manda
/// (design.md — D2).
/// </summary>
internal static class ModelVersionWrite
{
    internal static async Task<(EstimationModel Model, ModelVersion Draft)> OpenDraftAsync(
        IEstimationModelRepository repository,
        Guid modelId,
        int versionNumber,
        string author,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(author))
        {
            throw new BadRequestException(
                "Un cambio de configuración no se guarda sin autor: el historial quedaría anónimo.");
        }

        (EstimationModel model, ModelVersion version) = await EstimationModelLookup.FindAsync(
            repository,
            new ModelVersionQuery(modelId, versionNumber),
            cancellationToken);

        return !version.Status.IsDraft
            ? throw new ConflictException(
                $"La versión {version.Number} está {version.Status} y no se edita. " +
                "Para cambiarla, se crea una versión nueva a partir de ella.")
            : (model, version);
    }

    internal static EstimationOutput OutputOf(string raw) =>
        Enum.TryParse(raw, ignoreCase: true, out EstimationOutput output)
            ? output
            : throw new BadRequestException(
                $"«{raw}» no es una salida del modelo. Las salidas son: " +
                $"{string.Join(", ", Enum.GetNames<EstimationOutput>())}.");
}

// ── Crear una versión a partir de otra ───────────────────────────────────────

public sealed record CreateModelVersionCommand(Guid ModelId, CreateModelVersionRequest Request);

public sealed record CreateModelVersionResponse(int Number, string Status);

public sealed class CreateModelVersionUseCase(
    IEstimationModelRepository repository,
    IUnitOfWork unitOfWork)
    : IUseCase<CreateModelVersionCommand, CreateModelVersionResponse>
{
    public async Task<CreateModelVersionResponse> ExecuteAsync(
        CreateModelVersionCommand command,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(command.Request.Author))
        {
            throw new BadRequestException("Crear una versión exige el autor.");
        }

        EstimationModel model = await repository.GetWithContentAsync(command.ModelId, cancellationToken)
            ?? throw new NotFoundException($"No existe el modelo {command.ModelId}.");

        ModelVersion draft = model.CreateVersionFrom(
            command.Request.SourceVersion,
            command.Request.Author,
            DateTime.UtcNow);

        repository.Update(model);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateModelVersionResponse(draft.Number, draft.Status.Value);
    }
}

// ── Guardar una sección del borrador ─────────────────────────────────────────

public sealed record SaveDimensionsCommand(Guid ModelId, int VersionNumber, SaveDimensionsRequest Request);

/// <summary>Dimensiones, preguntas con sus opciones, y el tamizaje: la primera sección del editor.</summary>
public sealed class SaveModelDimensionsUseCase(
    IEstimationModelRepository repository,
    IUnitOfWork unitOfWork)
    : IUseCase<SaveDimensionsCommand, GetModelVersionValidationResponse>
{
    public async Task<GetModelVersionValidationResponse> ExecuteAsync(
        SaveDimensionsCommand command,
        CancellationToken cancellationToken = default)
    {
        SaveDimensionsRequest request = command.Request;
        (EstimationModel model, ModelVersion draft) = await ModelVersionWrite.OpenDraftAsync(
            repository, command.ModelId, command.VersionNumber, request.Author, cancellationToken);

        DateTime now = DateTime.UtcNow;

        draft.ReplaceDimensions(
            [
                .. request.Dimensions.Select(d =>
                    new ModelDimension(d.Code, d.Name, d.Order, d.Active)),
            ],
            request.Author,
            now);

        // Los pesos no llegan en esta sección: se editan en la de drivers. Se
        // conservan los que la pregunta ya tenía, y una pregunta nueva nace sin
        // ninguno — que es "no aporta a nada" y la validación lo advierte.
        var existingWeights = draft.Questions.ToDictionary(
            q => q.Code,
            q => q.Weights,
            StringComparer.Ordinal);

        draft.ReplaceQuestions(
            [
                .. request.Questions.Select((q, index) => new ModelQuestion(
                    index,
                    q.Code,
                    q.DimensionCode,
                    q.Texto,
                    ParseType(q.Type),
                    q.Unit,
                    q.DriverCode,
                    q.Active,
                    [
                        .. q.Options.Select((o, position) =>
                            new ModelQuestionOption(position, o.Label, o.Score, o.From, o.To)),
                    ],
                    existingWeights.GetValueOrDefault(q.Code, new Dictionary<EstimationOutput, decimal>()))),
            ],
            request.Author,
            now);

        draft.ReplaceTriage(
            [
                .. request.Triage.Select((t, index) =>
                    new ModelTriageQuestion(index, t.Code, t.Texto, t.Critical)),
            ],
            request.Author,
            now);

        repository.Update(model);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new GetModelVersionValidationResponse(
            EstimationModelLookup.ToDto(ModelVersionValidation.Validate(draft)));
    }

    private static EstimationQuestionType ParseType(string raw) =>
        Enum.TryParse(raw, ignoreCase: true, out EstimationQuestionType type)
            ? type
            : throw new BadRequestException(
                $"«{raw}» no es un tipo de pregunta. Los tipos son: " +
                $"{string.Join(", ", Enum.GetNames<EstimationQuestionType>())}.");
}

public sealed record SaveDriversCommand(Guid ModelId, int VersionNumber, SaveDriversRequest Request);

/// <summary>Drivers y la matriz de pesos por salida: la segunda sección del editor.</summary>
public sealed class SaveModelDriversUseCase(
    IEstimationModelRepository repository,
    IUnitOfWork unitOfWork)
    : IUseCase<SaveDriversCommand, GetModelVersionValidationResponse>
{
    public async Task<GetModelVersionValidationResponse> ExecuteAsync(
        SaveDriversCommand command,
        CancellationToken cancellationToken = default)
    {
        SaveDriversRequest request = command.Request;
        (EstimationModel model, ModelVersion draft) = await ModelVersionWrite.OpenDraftAsync(
            repository, command.ModelId, command.VersionNumber, request.Author, cancellationToken);

        DateTime now = DateTime.UtcNow;

        draft.ReplaceDrivers(
            [
                .. request.Drivers.Select(d => new ModelDriver(
                    d.Code,
                    d.Description,
                    [.. d.Outputs.Select(ModelVersionWrite.OutputOf)])),
            ],
            request.Author,
            now);

        foreach (QuestionWeightsInput row in request.Weights)
        {
            // Sólo las claves que el cliente manda. Una salida que no viene es
            // "no aporta", y por eso se reemplaza la fila entera en vez de
            // fusionarla: fusionar dejaría vivo un peso que alguien quitó.
            draft.SetQuestionWeights(
                row.QuestionCode,
                row.Weights.ToDictionary(
                    pair => ModelVersionWrite.OutputOf(pair.Key),
                    pair => pair.Value),
                request.Author,
                now);
        }

        repository.Update(model);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new GetModelVersionValidationResponse(
            EstimationModelLookup.ToDto(ModelVersionValidation.Validate(draft)));
    }
}

public sealed record SaveTallaRulesCommand(Guid ModelId, int VersionNumber, SaveTallaRulesRequest Request);

/// <summary>Reglas de talla, parámetros de esfuerzo y bandas de riesgo: la tercera sección.</summary>
public sealed class SaveModelTallaRulesUseCase(
    IEstimationModelRepository repository,
    IUnitOfWork unitOfWork)
    : IUseCase<SaveTallaRulesCommand, GetModelVersionValidationResponse>
{
    public async Task<GetModelVersionValidationResponse> ExecuteAsync(
        SaveTallaRulesCommand command,
        CancellationToken cancellationToken = default)
    {
        SaveTallaRulesRequest request = command.Request;
        (EstimationModel model, ModelVersion draft) = await ModelVersionWrite.OpenDraftAsync(
            repository, command.ModelId, command.VersionNumber, request.Author, cancellationToken);

        DateTime now = DateTime.UtcNow;

        draft.ReplaceTallaRules(
            [.. request.Boundaries],
            [
                .. request.Rules.Select((r, index) => new ModelTallaRule(
                    index, r.Talla, r.PmMin, r.PmExpected, r.PmMax, r.Lectura, r.Action)),
            ],
            request.Author,
            now);

        draft.ReplaceRiskBands(
            [
                .. request.RiskBands.Select((b, index) => new ModelRiskBand(index, b.Level, b.MaxPct)),
            ],
            request.Author,
            now);

        repository.Update(model);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new GetModelVersionValidationResponse(
            EstimationModelLookup.ToDto(ModelVersionValidation.Validate(draft)));
    }
}

public sealed record SaveMixCommand(Guid ModelId, int VersionNumber, SaveMixRequest Request);

/// <summary>Mix en porcentaje y sus modificadores: la cuarta sección.</summary>
public sealed class SaveModelMixUseCase(
    IEstimationModelRepository repository,
    IUnitOfWork unitOfWork)
    : IUseCase<SaveMixCommand, GetModelVersionValidationResponse>
{
    public async Task<GetModelVersionValidationResponse> ExecuteAsync(
        SaveMixCommand command,
        CancellationToken cancellationToken = default)
    {
        SaveMixRequest request = command.Request;
        (EstimationModel model, ModelVersion draft) = await ModelVersionWrite.OpenDraftAsync(
            repository, command.ModelId, command.VersionNumber, request.Author, cancellationToken);

        DateTime now = DateTime.UtcNow;

        draft.ReplaceMix(
            [
                .. request.Mix.Select((m, index) => new ModelMixRow(
                    index,
                    m.Key,
                    m.Capacidad,
                    m.PorTalla.ToDictionary(pair => pair.Key, pair => pair.Value, StringComparer.Ordinal))),
            ],
            request.Author,
            now);

        draft.ReplaceMixModifiers(
            [
                .. request.Modifiers.Select((m, index) => new MixModifier(
                    index,
                    m.Code,
                    m.DriverCode,
                    ParseOperator(m.Operator),
                    m.Threshold,
                    [.. m.Tallas],
                    [
                        .. m.Adjustments.Select((a, position) =>
                            new MixAdjustment(position, a.CapabilityKey, a.Points)),
                    ])),
            ],
            request.Author,
            now);

        repository.Update(model);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new GetModelVersionValidationResponse(
            EstimationModelLookup.ToDto(ModelVersionValidation.Validate(draft)));
    }

    private static MixConditionOperator ParseOperator(string raw) =>
        Enum.TryParse(raw, ignoreCase: true, out MixConditionOperator value)
            ? value
            : throw new BadRequestException($"«{raw}» no es un operador de condición. Use gte o lte.");
}

// ── Publicar ─────────────────────────────────────────────────────────────────

public sealed record PublishModelVersionCommand(
    Guid ModelId,
    int VersionNumber,
    PublishModelVersionRequest Request);

/// <summary>
/// El resultado de intentar publicar. <see cref="Published"/> en falso trae el
/// informe con los impedimentos, que es lo que el endpoint devuelve con 422: el
/// cliente necesita la lista para llevar a arreglarlos, no sólo el rechazo.
/// </summary>
public sealed record PublishModelVersionResponse(bool Published, ModelValidationReportDto Report);

public sealed class PublishModelVersionUseCase(
    IEstimationModelRepository repository,
    IUnitOfWork unitOfWork)
    : IUseCase<PublishModelVersionCommand, PublishModelVersionResponse>
{
    public async Task<PublishModelVersionResponse> ExecuteAsync(
        PublishModelVersionCommand command,
        CancellationToken cancellationToken = default)
    {
        PublishModelVersionRequest request = command.Request;
        (EstimationModel model, ModelVersion draft) = await ModelVersionWrite.OpenDraftAsync(
            repository, command.ModelId, command.VersionNumber, request.Author, cancellationToken);

        ModelValidationReport report = ModelVersionValidation.Validate(draft);
        if (!report.CanPublish)
        {
            return new PublishModelVersionResponse(false, EstimationModelLookup.ToDto(report));
        }

        model.Publish(
            draft.Number,
            request.EffectiveFrom,
            request.Note,
            request.Author,
            [.. report.Impediments.Select(c => c.Code)],
            DateTime.UtcNow);

        repository.Update(model);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new PublishModelVersionResponse(true, EstimationModelLookup.ToDto(report));
    }
}
