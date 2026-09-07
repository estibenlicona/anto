using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Initiatives;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Initiatives.UpdateInitiative;

public sealed record UpdateInitiativeRequest(
    Guid Id,
    string Name,
    Guid SquadId,
    string ProductOwner,
    int TargetMonths);

public sealed record UpdateInitiativeResponse(InitiativeDto Initiative);

/// <summary>
/// Edición de iniciativa. Si ya estaba evaluada, cambiar el plazo re-evalúa
/// con las **mismas respuestas**: el FTE es persona-mes sobre meses, así que
/// se mueve, pero puntos y talla no, porque nadie respondió distinto. La fecha
/// de guardado se conserva: esta no es una evaluación nueva.
/// </summary>
public sealed class UpdateInitiativeUseCase(
    IInitiativeRepository initiativeRepository,
    ISquadRepository squadRepository,
    IEvaluationModelProvider modelProvider,
    IUnitOfWork unitOfWork,
    IValidator<UpdateInitiativeRequest> validator)
    : IUseCase<UpdateInitiativeRequest, UpdateInitiativeResponse>
{
    public async Task<UpdateInitiativeResponse> ExecuteAsync(
        UpdateInitiativeRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult result = await validator.ValidateAsync(request, cancellationToken);
        if (!result.IsValid)
        {
            throw new DomainValidationException(result.Errors.Select(e => e.ErrorMessage));
        }

        Initiative? initiative = await initiativeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (initiative is null)
        {
            throw new NotFoundException("Iniciativa no encontrada");
        }

        Squad? squad = await squadRepository.GetByIdAsync(request.SquadId, cancellationToken);
        if (squad is null)
        {
            throw new NotFoundException($"Squad with id '{request.SquadId}' was not found.");
        }

        InitiativeEvaluation? stored = initiative.Evaluation;

        initiative.Update(request.Name, request.SquadId, request.ProductOwner, request.TargetMonths);

        if (stored is not null && stored.TargetMonths != request.TargetMonths)
        {
            EvaluationModelDto model = await modelProvider.GetAsync(cancellationToken);
            initiative.SaveEvaluation(EvaluationEngine.Evaluate(
                model,
                new EvaluationInput(stored.Triage, stored.Answers, request.TargetMonths),
                stored.SavedAtUtc));
        }

        initiativeRepository.Update(initiative);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        InitiativeContext context = await InitiativeContext.BuildAsync(
            initiativeRepository, squadRepository, cancellationToken);

        return new UpdateInitiativeResponse(context.ToDto(initiative));
    }
}
