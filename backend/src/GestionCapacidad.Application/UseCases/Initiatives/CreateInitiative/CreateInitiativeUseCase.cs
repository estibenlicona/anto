using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Initiatives;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;

/// <summary>El cuerpo del contrato: <c>InitiativeInput</c>.</summary>
public sealed record CreateInitiativeRequest(
    string Name,
    Guid SquadId,
    string ProductOwner,
    int TargetMonths);

public sealed record CreateInitiativeResponse(InitiativeDto Initiative);

/// <summary>
/// Alta de iniciativa: nace en evaluación y sin evaluar. Dimensionarla es un
/// paso aparte, porque exige responder el modelo entero.
/// </summary>
public sealed class CreateInitiativeUseCase(
    IInitiativeRepository initiativeRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreateInitiativeRequest> validator)
    : IUseCase<CreateInitiativeRequest, CreateInitiativeResponse>
{
    public async Task<CreateInitiativeResponse> ExecuteAsync(
        CreateInitiativeRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult result = await validator.ValidateAsync(request, cancellationToken);
        if (!result.IsValid)
        {
            throw new DomainValidationException(result.Errors.Select(e => e.ErrorMessage));
        }

        Squad? squad = await squadRepository.GetByIdAsync(request.SquadId, cancellationToken);
        if (squad is null)
        {
            throw new NotFoundException($"Squad with id '{request.SquadId}' was not found.");
        }

        var initiative = new Initiative(
            request.Name,
            request.SquadId,
            request.ProductOwner,
            request.TargetMonths);

        await initiativeRepository.AddAsync(initiative, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        InitiativeContext context = await InitiativeContext.BuildAsync(
            initiativeRepository, squadRepository, cancellationToken);

        return new CreateInitiativeResponse(context.ToDto(initiative));
    }
}
