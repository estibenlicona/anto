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

        // Rule: total allocation per person cannot exceed 100%
        int totalOthers = await allocationRepository.GetTotalDedicationForPersonAsync(
            allocation.PersonId, request.Id, cancellationToken);

        if (totalOthers + request.DedicationPercentage > 100)
            throw new BadRequestException(
                $"Total allocation would exceed 100% " +
                $"(others: {totalOthers}%, new value: {request.DedicationPercentage}%).");

        allocation.UpdateDedication(
            Percentage.From(request.DedicationPercentage),
            Percentage.From(request.BauPercentage),
            Percentage.From(request.TransformationPercentage),
            request.InitiativeId);

        allocationRepository.Update(allocation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var person = await personRepository.GetByIdAsync(allocation.PersonId, cancellationToken);
        var squad  = await squadRepository.GetByIdAsync(allocation.SquadId, cancellationToken);

        return AllocationMappings.ToUpdateResponse(allocation, person?.Name ?? string.Empty, squad?.Name ?? string.Empty);
    }
}
