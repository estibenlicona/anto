namespace GestionCapacidad.Application.ExternalServices.AzureDevOps;

/// <summary>Datos crudos de Azure DevOps para un colaborador y un rango de sprint — sin ninguna regla de negocio aplicada todavía.</summary>
public sealed record AzureDevOpsSyncDataDto(
    IReadOnlyList<RawWorkItemDto> WorkItems,
    IReadOnlyList<RawActivityDayDto> Activity);

/// <summary>Una historia tal como la devuelve Azure DevOps, con su historial de transiciones para reconstruir <c>wip</c>.</summary>
public sealed record RawWorkItemDto(
    string WorkItemId,
    int Number,
    string Title,
    string? Tag,
    string? EpicId,
    string? EpicTitle,
    string? InitiativeId,
    string? InitiativeName,
    decimal Points,
    string State,
    DateOnly AddedAt,
    string Board,
    string Url,
    IReadOnlyList<RawWorkItemTransitionDto> Transitions);

/// <summary>Un cambio de estado de una historia, en el orden en que ocurrió.</summary>
public sealed record RawWorkItemTransitionDto(DateTime At, string State);

/// <summary>Actividad de repositorios de un día calendario.</summary>
public sealed record RawActivityDayDto(DateOnly Date, int Commits, int Releases, int Features);
