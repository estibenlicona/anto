using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Entities;

public sealed class Team : AggregateRoot
{
    private Team()
    {
    }

    public Team(string name, string? description)
    {
        SetName(name);
        SetDescription(description);

        AddDomainEvent(new TeamCreatedEvent(Id, Name));
    }

    public string Name { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public void Rename(string newName)
    {
        var oldName = Name;
        SetName(newName);
        MarkUpdated();
        AddDomainEvent(new TeamRenamedEvent(Id, oldName, Name));
    }

    public void UpdateDescription(string? description)
    {
        SetDescription(description);
        MarkUpdated();
    }

    private void SetName(string name)
    {
        EnsureRequired(name, nameof(Name), 100);
        Name = name.Trim();
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
