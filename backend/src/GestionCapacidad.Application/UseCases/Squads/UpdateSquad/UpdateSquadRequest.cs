namespace GestionCapacidad.Application.UseCases.Squads.UpdateSquad;

public sealed record UpdateSquadRequest(
    Guid Id,
    string Name,
    Guid TeamId,
    string Criticality,
    string? Description);
