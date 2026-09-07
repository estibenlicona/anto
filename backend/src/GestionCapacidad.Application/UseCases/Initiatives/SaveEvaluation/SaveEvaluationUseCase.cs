using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
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
/// La validación vive acá y no en un <c>AbstractValidator</c> porque depende
/// del modelo vigente: cuántas preguntas tiene el tamizaje y qué ids existen
/// en el pool son datos, no constantes.
/// </summary>
public sealed class SaveEvaluationUseCase(
    IInitiativeRepository initiativeRepository,
    ISquadRepository squadRepository,
    IEvaluationModelProvider modelProvider,
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

        Validate(request, model);

        InitiativeEvaluation evaluation = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput(request.Triage, request.Answers, request.TargetMonths),
            timeProvider.GetUtcNow().UtcDateTime);

        initiative.SaveEvaluation(evaluation);

        initiativeRepository.Update(initiative);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        InitiativeContext context = await InitiativeContext.BuildAsync(
            initiativeRepository, squadRepository, cancellationToken);

        return new SaveEvaluationResponse(context.ToDto(initiative));
    }

    private static void Validate(SaveEvaluationRequest request, EvaluationModelDto model)
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
        foreach ((string id, int value) in request.Answers)
        {
            if (!known.Contains(id))
            {
                throw new BadRequestException($"La pregunta '{id}' no está en el modelo vigente.");
            }

            if (value < 0 || value > EvaluationEngine.ScoreMax)
            {
                throw new BadRequestException(
                    $"La respuesta de la pregunta '{id}' debe estar entre 0 y {EvaluationEngine.ScoreMax}.");
            }
        }
    }
}
