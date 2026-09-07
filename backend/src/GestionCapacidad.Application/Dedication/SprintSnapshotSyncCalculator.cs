using GestionCapacidad.Application.ExternalServices.AzureDevOps;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Dedication;

public sealed record SprintSnapshotSyncResult(
    decimal CommittedAtStartPoints,
    decimal AddedDuringSprintPoints,
    int? Wip,
    IReadOnlyList<ConcurrentInitiativeSnapshot> Initiatives,
    IReadOnlyList<WorkItemSnapshot> WorkItems,
    IReadOnlyList<ActivityDaySnapshot> Activity);

/// <summary>
/// Reduce los datos crudos de Azure DevOps a lo que <see cref="SprintSnapshot"/>
/// necesita guardar. Determinista y sin I/O — el cliente HTTP sólo trae
/// datos; acá vive toda la regla de negocio de la sincronización.
/// </summary>
public static class SprintSnapshotSyncCalculator
{
    /// <summary>Un work item en uno de estos estados no cuenta como "en progreso" para <c>wip</c>.</summary>
    private static readonly string[] InactiveStates = ["New", "Done", "Removed"];

    public static SprintSnapshotSyncResult Compute(AzureDevOpsSyncDataDto raw, DateOnly sprintStart)
    {
        ArgumentNullException.ThrowIfNull(raw);

        decimal committedAtStart = 0m;
        decimal addedDuring = 0m;
        foreach (RawWorkItemDto item in raw.WorkItems)
        {
            if (item.AddedAt <= sprintStart)
            {
                committedAtStart += item.Points;
            }
            else
            {
                addedDuring += item.Points;
            }
        }

        return new SprintSnapshotSyncResult(
            committedAtStart,
            addedDuring,
            ComputeWip(raw.WorkItems),
            BuildInitiatives(raw.WorkItems),
            [.. raw.WorkItems.Select(item => ToWorkItemSnapshot(item, sprintStart))],
            [.. raw.Activity.Select(a => new ActivityDaySnapshot(a.Date, a.Commits, a.Releases, a.Features))]);
    }

    /// <summary>
    /// Máximo de historias activas a la vez, a partir de sus transiciones de
    /// estado. Nulo sólo si ningún work item aportó transiciones utilizables
    /// — uno solo sin historial no invalida el cálculo del resto.
    /// </summary>
    private static int? ComputeWip(IReadOnlyList<RawWorkItemDto> workItems)
    {
        List<(DateTime At, int Delta)> events = [];
        var anyUsableHistory = false;

        foreach (RawWorkItemDto item in workItems)
        {
            List<RawWorkItemTransitionDto> ordered = [.. item.Transitions.OrderBy(t => t.At)];
            if (ordered.Count == 0)
            {
                continue;
            }

            anyUsableHistory = true;
            var wasActive = false;
            foreach (RawWorkItemTransitionDto transition in ordered)
            {
                bool isActive = !InactiveStates.Contains(transition.State, StringComparer.OrdinalIgnoreCase);
                if (isActive && !wasActive)
                {
                    events.Add((transition.At, +1));
                }
                else if (!isActive && wasActive)
                {
                    events.Add((transition.At, -1));
                }

                wasActive = isActive;
            }
        }

        if (!anyUsableHistory)
        {
            return null;
        }

        var running = 0;
        var max = 0;
        foreach ((DateTime _, int delta) in events.OrderBy(e => e.At))
        {
            running += delta;
            max = Math.Max(max, running);
        }

        return max;
    }

    private static IReadOnlyList<ConcurrentInitiativeSnapshot> BuildInitiatives(IReadOnlyList<RawWorkItemDto> workItems) =>
        [.. workItems
            .Where(w => w.EpicId is not null)
            .GroupBy(w => w.EpicId)
            .Select(g => new ConcurrentInitiativeSnapshot(
                g.Key!,
                g.First().EpicTitle ?? string.Empty,
                g.First().InitiativeId,
                g.First().InitiativeName,
                g.Sum(w => w.Points)))];

    private static WorkItemSnapshot ToWorkItemSnapshot(RawWorkItemDto item, DateOnly sprintStart) => new(
        item.WorkItemId,
        item.Number,
        item.Title,
        item.Tag is null ? null : WorkItemTag.From(item.Tag),
        item.EpicId,
        item.EpicTitle,
        item.InitiativeId,
        item.InitiativeName,
        item.Points,
        item.State,
        item.AddedAt > sprintStart,
        item.Board,
        item.Url);
}
