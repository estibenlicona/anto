using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Allocations.CreateAllocation;

public sealed class CreateAllocationUseCase(
    IAllocationRepository allocationRepository,
    IPersonRepository personRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreateAllocationRequest> validator) : IUseCase<CreateAllocationRequest, CreateAllocationResponse>
{
    public async Task<CreateAllocationResponse> ExecuteAsync(
        CreateAllocationRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult result = await validator.ValidateAsync(request, cancellationToken);
        if (!result.IsValid)
            throw new DomainValidationException(result.Errors.Select(e => e.ErrorMessage));

        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
            throw new NotFoundException($"Person with id '{request.PersonId}' was not found.");

        Squad? squad = await squadRepository.GetByIdAsync(request.SquadId, cancellationToken);
        if (squad is null)
            throw new NotFoundException($"Squad with id '{request.SquadId}' was not found.");

        if (await allocationRepository.ExistsByPersonAndSquadAsync(request.PersonId, request.SquadId, cancellationToken))
            throw new BadRequestException($"Person '{person.Name}' is already allocated to squad '{squad.Name}'.");

        // Rule: total allocation per person cannot exceed 100%
        int totalExisting = await allocationRepository.GetTotalDedicationForPersonAsync(
            request.PersonId, Guid.Empty, cancellationToken);

        if (totalExisting + request.DedicationPercentage > 100)
            throw new BadRequestException(
                $"Total allocation for '{person.Name}' would exceed 100% " +
                $"(current: {totalExisting}%, adding: {request.DedicationPercentage}%).");

        var allocation = new Allocation(
            request.PersonId,
            request.SquadId,
            request.InitiativeId,
            Percentage.From(request.DedicationPercentage),
            Percentage.From(request.BauPercentage),
            Percentage.From(request.TransformationPercentage));

        await allocationRepository.AddAsync(allocation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return AllocationMappings.ToCreateResponse(allocation, person.Name, squad.Name);
    }
}
