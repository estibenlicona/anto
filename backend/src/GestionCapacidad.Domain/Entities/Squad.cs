using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

public sealed class Squad : AggregateRoot
{
    private Squad()
    {
    }

    public Squad(string name, Criticality criticality, string tribe, string? description)
    {
        SetName(name);
        Criticality = criticality;
        SetTribe(tribe);
        SetDescription(description);

        AddDomainEvent(new SquadCreatedEvent(Id, Name));
    }

    public string Name { get; private set; } = string.Empty;

    public Criticality Criticality { get; private set; } = Criticality.Medium;

    public string Tribe { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public Guid? DevOpsBoardId { get; private set; }

    public void Rename(string newName)
    {
        var oldName = Name;
        SetName(newName);
        MarkUpdated();
        AddDomainEvent(new SquadRenamedEvent(Id, oldName, Name));
    }

    public void ChangeCriticality(Criticality newCriticality)
    {
        if (Criticality == newCriticality)
        {
            return;
        }

        var oldCriticality = Criticality;
        Criticality = newCriticality;
        MarkUpdated();
        AddDomainEvent(new SquadCriticalityChangedEvent(Id, oldCriticality, newCriticality));
    }

    public void MoveTribe(string tribe)
    {
        SetTribe(tribe);
        MarkUpdated();
    }

    public void UpdateDescription(string? description)
    {
        SetDescription(description);
        MarkUpdated();
    }

    public void LinkDevOpsBoard(Guid boardId)
    {
        if (boardId == Guid.Empty)
        {
            throw new DomainException("DevOps board ID must not be empty.");
        }

        DevOpsBoardId = boardId;
        MarkUpdated();
        AddDomainEvent(new SquadDevOpsBoardLinkedEvent(Id, boardId));
    }

    public void UnlinkDevOpsBoard()
    {
        DevOpsBoardId = null;
        MarkUpdated();
        AddDomainEvent(new SquadDevOpsBoardUnlinkedEvent(Id));
    }

    private void SetName(string name)
    {
        EnsureRequired(name, nameof(Name), 200);
        Name = name.Trim();
    }

    private void SetTribe(string tribe)
    {
        EnsureRequired(tribe, nameof(Tribe), 100);
        Tribe = tribe.Trim();
    }

    private void SetDescription(string? description)
    {
        if (description is not null && description.Length > 500)
        {
            throw new DomainException($"{nameof(Description)} cannot exceed 500 characters.");
        }

        Description = description?.Trim();
    }

    private static void EnsureRequired(string value, string fieldName, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException($"{fieldName} is required.");
        }

        if (value.Length > maxLength)
        {
            throw new DomainException($"{fieldName} cannot exceed {maxLength} characters.");
        }
    }
}
