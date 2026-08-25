using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.Squads.GetSquads;

public sealed record GetSquadsResponse(PagedResult<SquadDto> Squads);
