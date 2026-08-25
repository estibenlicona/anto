using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.Allocations.GetAllocationsBySquad;

public sealed record GetAllocationsBySquadResponse(PagedResult<AllocationDto> Allocations);
