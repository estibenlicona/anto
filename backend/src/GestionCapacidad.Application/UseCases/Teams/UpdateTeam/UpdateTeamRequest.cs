namespace GestionCapacidad.Application.UseCases.Teams.UpdateTeam;

public sealed record UpdateTeamRequest(
    Guid Id,
    string Name,
    string? Description);
