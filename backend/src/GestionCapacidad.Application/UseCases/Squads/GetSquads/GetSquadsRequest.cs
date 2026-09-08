namespace GestionCapacidad.Application.UseCases.Squads.GetSquads;

public sealed record GetSquadsRequest(
    int Page,
    int PageSize,
    string? Search = null,
    IReadOnlyCollection<string>? Criticalities = null,
    IReadOnlyCollection<Guid>? TeamIds = null);
