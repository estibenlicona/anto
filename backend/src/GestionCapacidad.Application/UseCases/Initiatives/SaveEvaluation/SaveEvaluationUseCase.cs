using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Estimation;
using GestionCapacidad.Application.Initiatives;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Initiatives.SaveEvaluation;

/// <summary>
/// El cuerpo del contrato: las respuestas del tamizaje, las de las preguntas
/// (por id, las no respondidas simplemente no vienen) y el plazo.
/// </summary>
public sealed record SaveEvaluationRequest(
    Guid Id,
    IReadOnlyList<bool> Triage,
    IReadOnlyDictionary<string, int> Answers,
    int TargetMonths);

public sealed record SaveEvaluationResponse(InitiativeDto Initiative);

/// <summary>
/// Guarda la evaluación de dimensionamiento. El cliente manda **respuestas**;
/// todo lo demás —puntos, talla, FTE, composición y veredicto— lo calcula el
/// servidor con el modelo vigente, para que nadie pueda declararse una talla.
///
/// Además de calcular, guarda **con qué versión del modelo se calculó**: es lo
/// que hace que publicar una versión nueva deje de reescribir lo ya estimado.
///
/// La validación vive acá y no en un <c>AbstractValidator</c> porque depende de
/// la versión vigente: qué ids existen y qué opciones admite cada pregunta son
/// datos, no constantes. Y ya no es un rango 0–4 cableado: cada pregunta admite
/// exactamente las opciones que su versión declara.
/// </summary>
public sealed class SaveEvaluationUseCase(
    IInitiativeRepository initiativeRepository,
    ISquadRepository squadRepository,
    IEvaluationModelProvider modelProvider,
    IEstimationVersionProvider versionProvider,
    IUnitOfWork unitOfWork,
    TimeProvider timeProvider) : IUseCase<SaveEvaluationRequest, SaveEvaluationResponse>
{
    public async Task<SaveEvaluationResponse> ExecuteAsync(
        SaveEvaluationRequest request,
        CancellationToken cancellationToken = default)
    {
        Initiative? initiative = await initiativeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (initiative is null)
        {
            throw new NotFoundException("Iniciativa no encontrada");
        }

        EvaluationModelDto model = await modelProvider.GetAsync(cancellationToken);
        EstimationModelVersionDto? version = await versionProvider.GetCurrentAsync(1, cancellationToken);

        Validate(request, model, version);

        InitiativeEvaluation evaluation = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput(request.Triage, request.Answers, request.TargetMonths),
            timeProvider.GetUtcNow().UtcDateTime);

        if (version is not null)
        {
            evaluation = evaluation with
            {
                ModelVersionId = Guid.Parse(version.VersionId),
                ModelVersionNumber = version.VersionNumber,
            };
        }

        initiative.SaveEvaluation(evaluation);

        initiativeRepository.Update(initiative);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        InitiativeContext context = await InitiativeContext.BuildAsync(
            initiativeRepository, squadRepository, cancellationToken);

        return new SaveEvaluationResponse(context.ToDto(initiative));
    }

    private static void Validate(
        SaveEvaluationRequest request,
        EvaluationModelDto model,
        EstimationModelVersionDto? version)
    {
        if (request.Triage is null || request.Triage.Count != model.Triage.Count)
        {
            throw new BadRequestException(
                $"El tamizaje debe traer exactamente {model.Triage.Count} respuestas.");
        }

        if (request.TargetMonths < Initiative.MinTargetMonths ||
            request.TargetMonths > Initiative.MaxTargetMonths)
        {
            throw new BadRequestException(
                $"El plazo debe estar entre {Initiative.MinTargetMonths} y {Initiative.MaxTargetMonths} meses.");
        }

        if (request.Answers is null)
        {
            throw new BadRequestException("Las respuestas son obligatorias.");
        }

        var known = model.Questions.Select(q => q.Id).ToHashSet(StringComparer.Ordinal);

        // Cuántas opciones admite cada pregunta lo dice la versión vigente. Sin
        // versión —una base recién creada— se cae al tope de la escala de hoy,
        // que es lo único que hay con qué comparar.
        Dictionary<string, int> optionCounts = version is null
            ? []
            : version.Questions.ToDictionary(q => q.Id, q => q.Options.Count, StringComparer.Ordinal);

        foreach ((string id, int value) in request.Answers)
        {
            if (!known.Contains(id))
            {
                throw new BadRequestException($"La pregunta '{id}' no está en el modelo vigente.");
            }

            int count = optionCounts.GetValueOrDefault(id, EvaluationEngine.ScoreMax + 1);
            if (value < 0 || value >= count)
            {
                throw new BadRequestException(
                    $"La respuesta de la pregunta '{id}' no corresponde a ninguna de sus {count} opciones.");
            }
        }
    }
}
