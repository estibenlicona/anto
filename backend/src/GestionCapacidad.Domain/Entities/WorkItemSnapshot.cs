using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>Una historia del sprint, congelada tal como llegó a cerrarse el snapshot.</summary>
public sealed class WorkItemSnapshot
{
    private WorkItemSnapshot()
    {
    }

    public WorkItemSnapshot(
        string workItemId,
        int number,
        string title,
        WorkItemTag? tag,
        string? epicId,
        string? epicTitle,
        string? initiativeId,
        string? initiativeName,
        decimal points,
        string state,
        bool addedAfterSprintStart,
        string board,
        string url)
    {
        WorkItemId = workItemId;
        Number = number;
        Title = title;
        Tag = tag;
        EpicId = epicId;
        EpicTitle = epicTitle;
        InitiativeId = initiativeId;
        InitiativeName = initiativeName;
        Points = points;
        State = state;
        AddedAfterSprintStart = addedAfterSprintStart;
        Board = board;
        Url = url;
    }

    public string WorkItemId { get; private set; } = string.Empty;

    public int Number { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public WorkItemTag? Tag { get; private set; }

    public string? EpicId { get; private set; }

    public string? EpicTitle { get; private set; }

    public string? InitiativeId { get; private set; }

    public string? InitiativeName { get; private set; }

    public decimal Points { get; private set; }

    public string State { get; private set; } = string.Empty;

    public bool AddedAfterSprintStart { get; private set; }

    public string Board { get; private set; } = string.Empty;

    public string Url { get; private set; } = string.Empty;
}
