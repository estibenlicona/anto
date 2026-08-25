using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Entities;

public sealed class BauTask : AggregateRoot
{
    private BauTask()
    {
    }

    public BauTask(Guid squadId, string name)
    {
        if (squadId == Guid.Empty)
            throw new DomainException("Squad ID must not be empty.");

        SetName(name);
        SquadId = squadId;

        AddDomainEvent(new BauTaskCreatedEvent(Id, SquadId, Name));
    }

    public Guid SquadId { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public void Rename(string newName)
    {
        var oldName = Name;
        SetName(newName);
        MarkUpdated();
        AddDomainEvent(new BauTaskRenamedEvent(Id, oldName, Name));
    }

    private void SetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException($"{nameof(Name)} is required.");

        if (name.Length > 200)
            throw new DomainException($"{nameof(Name)} cannot exceed 200 characters.");

        Name = name.Trim();
    }
}
