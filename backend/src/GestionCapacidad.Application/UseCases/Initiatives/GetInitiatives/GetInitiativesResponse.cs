using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.Initiatives.GetInitiatives;

public sealed record GetInitiativesResponse(IReadOnlyList<InitiativeDto> Initiatives);
