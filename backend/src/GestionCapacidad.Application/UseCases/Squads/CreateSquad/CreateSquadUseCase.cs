using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Squads.CreateSquad;

public sealed class CreateSquadUseCase(
    ISquadRepository squadRepository,
    ITeamRepository teamRepository,
    IAllocationRepository allocationRepository,
    IPersonRepository personRepository,
    IInitiativeRepository initiativeRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreateSquadRequest> validator) : IUseCase<CreateSquadRequest, CreateSquadResponse>
{
    public async Task<CreateSquadResponse> ExecuteAsync(
        CreateSquadRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        if (await squadRepository.ExistsByNameAsync(request.Name, cancellationToken))
        {
            throw new BadRequestException($"A squad named '{request.Name}' already exists.");
        }

        Team? team = await teamRepository.GetByIdAsync(request.TeamId, cancellationToken);
        if (team is null)
        {
            throw new BadRequestException($"Team with id '{request.TeamId}' was not found.");
        }

        var squad = new Squad(
            request.Name,
            Criticality.From(request.Criticality),
            request.TeamId,
            request.Description);

        await squadRepository.AddAsync(squad, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        SquadAggregates aggregates = SquadAggregates.Build(
            await allocationRepository.GetAllAsync(cancellationToken),
            await personRepository.GetAllAsync(cancellationToken),
            await initiativeRepository.GetAllAsync(cancellationToken));

        return SquadMappings.ToCreateResponse(squad, aggregates.For(squad.Id), team.Name);
    }
}
