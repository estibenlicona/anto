using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Teams.GetTeamById;

public sealed class GetTeamByIdUseCase(
    ITeamRepository teamRepository,
    ISquadRepository squadRepository) : IUseCase<GetTeamByIdRequest, GetTeamByIdResponse>
{
    public async Task<GetTeamByIdResponse> ExecuteAsync(
        GetTeamByIdRequest request,
        CancellationToken cancellationToken = default)
    {
        Team? team = await teamRepository.GetByIdAsync(request.Id, cancellationToken);
        if (team is null)
        {
            throw new NotFoundException($"Team with id '{request.Id}' was not found.");
        }

        IReadOnlyList<Squad> squads = await squadRepository.GetAllAsync(cancellationToken);
        int squadCount = squads.Count(s => s.TeamId == team.Id);

        return new GetTeamByIdResponse(TeamMappings.ToDto(team, squadCount));
    }
}
