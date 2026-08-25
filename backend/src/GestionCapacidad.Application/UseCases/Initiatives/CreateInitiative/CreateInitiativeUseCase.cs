using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;

public sealed class CreateInitiativeUseCase(
    IInitiativeRepository initiativeRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreateInitiativeRequest> validator) : IUseCase<CreateInitiativeRequest, CreateInitiativeResponse>
{
    public async Task<CreateInitiativeResponse> ExecuteAsync(
        CreateInitiativeRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult result = await validator.ValidateAsync(request, cancellationToken);
        if (!result.IsValid)
            throw new DomainValidationException(result.Errors.Select(e => e.ErrorMessage));

        Squad? squad = await squadRepository.GetByIdAsync(request.SquadId, cancellationToken);
        if (squad is null)
            throw new NotFoundException($"Squad with id '{request.SquadId}' was not found.");

        var initiative = new Initiative(
            request.SquadId,
            request.Name,
            InitiativeType.From(request.Type),
            request.DeadlineMonths);

        await initiativeRepository.AddAsync(initiative, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return InitiativeMappings.ToCreateResponse(initiative);
    }
}
