using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

public sealed class Initiative : AggregateRoot
{
    private Initiative()
    {
    }

    public Initiative(Guid squadId, string name, InitiativeType type, int deadlineMonths)
    {
        if (squadId == Guid.Empty)
            throw new DomainException("Squad ID must not be empty.");

        SetName(name);
        SetDeadline(deadlineMonths);

        SquadId  = squadId;
        Type     = type;
        Status   = InitiativeStatus.Evaluation;

        AddDomainEvent(new InitiativeCreatedEvent(Id, SquadId, Name));
    }

    public Guid SquadId { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public InitiativeType Type { get; private set; } = InitiativeType.Transformation;

    public InitiativeStatus Status { get; private set; } = InitiativeStatus.Evaluation;

    public int DeadlineMonths { get; private set; }

    public bool BacklogDefined { get; private set; }

    public bool ArchitectureDefined { get; private set; }

    public bool EarlyStageCompleted { get; private set; }

    // ── Rename ────────────────────────────────────────────────────────────────

    public void Rename(string newName)
    {
        var oldName = Name;
        SetName(newName);
        MarkUpdated();
        AddDomainEvent(new InitiativeRenamedEvent(Id, oldName, Name));
    }

    // ── Status ────────────────────────────────────────────────────────────────

    /// <summary>
    /// Changes the initiative status.
    /// Rule: only 1 Active initiative per squad is enforced at the Use Case level
    /// (requires repository access). This method only validates the status transition.
    /// </summary>
    public void ChangeStatus(InitiativeStatus newStatus)
    {
        if (Status == newStatus) return;

        var oldStatus = Status;
        Status = newStatus;
        MarkUpdated();
        AddDomainEvent(new InitiativeStatusChangedEvent(Id, SquadId, oldStatus, newStatus));
    }

    // ── Deadline ──────────────────────────────────────────────────────────────

    public void UpdateDeadline(int months)
    {
        SetDeadline(months);
        MarkUpdated();
    }

    // ── Prerequisites ─────────────────────────────────────────────────────────

    public void MarkBacklogDefined()
    {
        BacklogDefined = true;
        MarkUpdated();
    }

    public void MarkArchitectureDefined()
    {
        ArchitectureDefined = true;
        MarkUpdated();
    }

    public void MarkEarlyStageCompleted()
    {
        EarlyStageCompleted = true;
        MarkUpdated();
    }

    // ── Private guards ────────────────────────────────────────────────────────

    private void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException($"{nameof(Name)} is required.");

        if (name.Length > 300)
            throw new DomainException($"{nameof(Name)} cannot exceed 300 characters.");

        Name = name.Trim();
    }

    private void SetDeadline(int months)
    {
        if (months < 1)
            throw new DomainException("Deadline must be at least 1 month.");

        DeadlineMonths = months;
    }
}
