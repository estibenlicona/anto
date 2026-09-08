namespace GestionCapacidad.Application.UseCases.Teams.GetTeams;

public sealed record GetTeamsRequest(
    int Page,
    int PageSize,
    string? Search = null);
