namespace GestionCapacidad.Application.UseCases.Squads.CreateSquad;

public sealed record CreateSquadRequest(
    string Name,
    string Criticality,
    string Tribe,
    string? Description);
