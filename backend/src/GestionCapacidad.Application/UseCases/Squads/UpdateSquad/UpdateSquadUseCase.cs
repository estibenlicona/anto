using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Squads.UpdateSquad;

public sealed class UpdateSquadUseCase(
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork,
    IValidator<UpdateSquadRequest> validator) : IUseCase<UpdateSquadRequest, UpdateSquadResponse>
{
    public async Task<UpdateSquadResponse> ExecuteAsync(
        UpdateSquadRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        Squad? squad = await squadRepository.GetByIdAsync(request.Id, cancellationToken);
        if (squad is null)
        {
            throw new NotFoundException($"Squad with id '{request.Id}' was not found.");
        }

        squad.Rename(request.Name);
        squad.ChangeCriticality(Criticality.From(request.Criticality));
        squad.MoveTribe(request.Tribe);
        squad.UpdateDescription(request.Description);

        squadRepository.Update(squad);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return SquadMappings.ToUpdateResponse(squad);
    }
}
