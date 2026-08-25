namespace GestionCapacidad.Application.UseCases.Squads.UpdateSquad;

public sealed record UpdateSquadResponse(
    Guid Id,
    string Name,
    string Criticality,
    string Tribe,
    string? Description,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
