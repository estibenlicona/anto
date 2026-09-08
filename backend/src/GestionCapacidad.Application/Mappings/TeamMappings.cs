using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Teams.CreateTeam;
using GestionCapacidad.Application.UseCases.Teams.UpdateTeam;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

public static class TeamMappings
{
    public static TeamDto ToDto(Team team, int squadCount) =>
        new(team.Id,
            team.Name,
            team.Description,
            team.CreatedAtUtc,
            team.UpdatedAtUtc ?? team.CreatedAtUtc,
            squadCount);

    public static CreateTeamResponse ToCreateResponse(Team team, int squadCount) =>
        new(ToDto(team, squadCount));

    public static UpdateTeamResponse ToUpdateResponse(Team team, int squadCount) =>
        new(ToDto(team, squadCount));
}
