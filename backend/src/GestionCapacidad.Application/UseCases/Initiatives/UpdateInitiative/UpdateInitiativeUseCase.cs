using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Initiatives.UpdateInitiative;

public sealed class UpdateInitiativeUseCase(
    IInitiativeRepository initiativeRepository,
    IUnitOfWork unitOfWork,
    IValidator<UpdateInitiativeRequest> validator) : IUseCase<UpdateInitiativeRequest, UpdateInitiativeResponse>
{
    public async Task<UpdateInitiativeResponse> ExecuteAsync(
        UpdateInitiativeRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult result = await validator.ValidateAsync(request, cancellationToken);
        if (!result.IsValid)
            throw new DomainValidationException(result.Errors.Select(e => e.ErrorMessage));

        Initiative? initiative = await initiativeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (initiative is null)
            throw new NotFoundException($"Initiative with id '{request.Id}' was not found.");

        initiative.Rename(request.Name);
        initiative.UpdateDeadline(request.DeadlineMonths);

        initiativeRepository.Update(initiative);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return InitiativeMappings.ToUpdateResponse(initiative);
    }
}
