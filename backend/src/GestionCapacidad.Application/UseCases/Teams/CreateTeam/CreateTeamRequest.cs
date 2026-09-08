namespace GestionCapacidad.Application.UseCases.Teams.CreateTeam;

public sealed record CreateTeamRequest(
    string Name,
    string? Description);
