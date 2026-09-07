using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Allocations.UpdateAllocation;

public sealed class UpdateAllocationUseCase(
    IAllocationRepository allocationRepository,
    IPersonRepository personRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork,
    IValidator<UpdateAllocationRequest> validator) : IUseCase<UpdateAllocationRequest, UpdateAllocationResponse>
{
    public async Task<UpdateAllocationResponse> ExecuteAsync(
        UpdateAllocationRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult result = await validator.ValidateAsync(request, cancellationToken);
        if (!result.IsValid)
            throw new DomainValidationException(result.Errors.Select(e => e.ErrorMessage));

        Allocation? allocation = await allocationRepository.GetByIdAsync(request.Id, cancellationToken);
        if (allocation is null)
            throw new NotFoundException($"Allocation with id '{request.Id}' was not found.");

        // La dedicación 1–100 y la mezcla que cuadre ya vienen validadas; con
        // la regla de asignación única no hay tope repartido que comprobar.
        allocation.UpdateDedication(
            Percentage.From(request.DedicationPercentage),
            Percentage.From(request.BauPercentage),
            Percentage.From(request.TransformationPercentage),
            allocation.InitiativeId);

        allocationRepository.Update(allocation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        Person? person = await personRepository.GetByIdAsync(allocation.PersonId, cancellationToken);
        Squad? squad = await squadRepository.GetByIdAsync(allocation.SquadId, cancellationToken);

        return AllocationMappings.ToUpdateResponse(allocation, person, squad?.Name ?? string.Empty);
    }
}
