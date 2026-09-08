using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.Teams.UpdateTeam;

public sealed class UpdateTeamUseCase(
    ITeamRepository teamRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork,
    IValidator<UpdateTeamRequest> validator) : IUseCase<UpdateTeamRequest, UpdateTeamResponse>
{
    public async Task<UpdateTeamResponse> ExecuteAsync(
        UpdateTeamRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));
        }

        Team? team = await teamRepository.GetByIdAsync(request.Id, cancellationToken);
        if (team is null)
        {
            throw new NotFoundException($"Team with id '{request.Id}' was not found.");
        }

        if (await teamRepository.ExistsByNameAsync(request.Name, request.Id, cancellationToken))
        {
            throw new BadRequestException($"A team named '{request.Name}' already exists.");
        }

        team.Rename(request.Name);
        team.UpdateDescription(request.Description);

        teamRepository.Update(team);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        IReadOnlyList<Squad> squads = await squadRepository.GetAllAsync(cancellationToken);
        int squadCount = squads.Count(s => s.TeamId == team.Id);

        return TeamMappings.ToUpdateResponse(team, squadCount);
    }
}
