namespace GestionCapacidad.Application.UseCases.People.GetPeople;

public sealed record GetPeopleRequest(
    int Page,
    int PageSize,
    string? Search = null,
    IReadOnlyCollection<int>? Levels = null,
    IReadOnlyCollection<string>? Seniorities = null,
    IReadOnlyCollection<string>? Stacks = null);
