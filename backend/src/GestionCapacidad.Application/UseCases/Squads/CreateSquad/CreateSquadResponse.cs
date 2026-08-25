namespace GestionCapacidad.Application.UseCases.Squads.CreateSquad;

public sealed record CreateSquadResponse(
    Guid Id,
    string Name,
    string Criticality,
    string Tribe,
    string? Description,
    DateTime CreatedAtUtc);
