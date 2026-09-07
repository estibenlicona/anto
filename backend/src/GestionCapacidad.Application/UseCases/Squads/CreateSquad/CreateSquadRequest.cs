namespace GestionCapacidad.Application.UseCases.Squads.CreateSquad;

public sealed record CreateSquadRequest(
    string Name,
    string Team,
    string Criticality,
    string? Description);
