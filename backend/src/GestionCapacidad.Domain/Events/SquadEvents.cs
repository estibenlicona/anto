using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Events;

public sealed record SquadCreatedEvent(Guid SquadId, string Name) : IDomainEvent;

public sealed record SquadRenamedEvent(Guid SquadId, string OldName, string NewName) : IDomainEvent;

public sealed record SquadCriticalityChangedEvent(
    Guid SquadId,
    ValueObjects.Criticality OldCriticality,
    ValueObjects.Criticality NewCriticality) : IDomainEvent;

public sealed record SquadDevOpsBoardLinkedEvent(Guid SquadId, Guid BoardId) : IDomainEvent;

public sealed record SquadDevOpsBoardUnlinkedEvent(Guid SquadId) : IDomainEvent;
