namespace GestionCapacidad.Application.UseCases.Squads.CreateSquad;

public sealed record CreateSquadRequest(
    string Name,
    Guid TeamId,
    string Criticality,
    string? Description);
