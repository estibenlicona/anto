namespace GestionCapacidad.Application.UseCases.People.GetPeople;

public sealed record GetPeopleRequest(
    int Page,
    int PageSize,
    string? Search = null,
    IReadOnlyCollection<int>? Seniorities = null);
