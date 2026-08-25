using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Events;

public sealed record InitiativeCreatedEvent(Guid InitiativeId, Guid SquadId, string Name) : IDomainEvent;

public sealed record InitiativeStatusChangedEvent(
    Guid InitiativeId,
    Guid SquadId,
    InitiativeStatus OldStatus,
    InitiativeStatus NewStatus) : IDomainEvent;

public sealed record InitiativeRenamedEvent(Guid InitiativeId, string OldName, string NewName) : IDomainEvent;
