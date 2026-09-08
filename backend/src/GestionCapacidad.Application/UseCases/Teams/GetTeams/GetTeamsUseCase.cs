using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Teams.GetTeams;

public sealed class GetTeamsUseCase(
    ITeamRepository teamRepository,
    ISquadRepository squadRepository) : IUseCase<GetTeamsRequest, GetTeamsResponse>
{
    public async Task<GetTeamsResponse> ExecuteAsync(
        GetTeamsRequest request,
        CancellationToken cancellationToken = default)
    {
        (IReadOnlyList<Team> teams, int totalCount) = await teamRepository.GetPagedAsync(
            request.Page,
            request.PageSize,
            request.Search,
            cancellationToken);

        IReadOnlyList<Squad> squads = await squadRepository.GetAllAsync(cancellationToken);
        Dictionary<Guid, int> squadCountsByTeamId = squads
            .GroupBy(s => s.TeamId)
            .ToDictionary(g => g.Key, g => g.Count());

        var dtos = teams
            .Select(t => TeamMappings.ToDto(t, squadCountsByTeamId.GetValueOrDefault(t.Id)))
            .ToList();

        return new GetTeamsResponse(
            PagedResult<TeamDto>.Create(dtos, totalCount, request.Page, request.PageSize));
    }
}
