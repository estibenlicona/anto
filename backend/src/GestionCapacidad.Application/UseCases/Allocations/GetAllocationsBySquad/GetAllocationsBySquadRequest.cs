namespace GestionCapacidad.Application.UseCases.Allocations.GetAllocationsBySquad;

public sealed record GetAllocationsBySquadRequest(Guid SquadId, int Page, int PageSize);
