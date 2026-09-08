using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.Teams.GetTeams;

public sealed record GetTeamsResponse(PagedResult<TeamDto> Teams);
