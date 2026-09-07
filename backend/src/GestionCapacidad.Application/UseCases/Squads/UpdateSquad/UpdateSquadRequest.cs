namespace GestionCapacidad.Application.UseCases.Squads.UpdateSquad;

public sealed record UpdateSquadRequest(
    Guid Id,
    string Name,
    string Team,
    string Criticality,
    string? Description);
