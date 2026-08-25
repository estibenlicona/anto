using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.Allocations.GetAllocationsByPerson;

public sealed record GetAllocationsByPersonResponse(IReadOnlyList<AllocationDto> Allocations);
