using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Events;

public sealed record TeamCreatedEvent(Guid TeamId, string Name) : IDomainEvent;

public sealed record TeamRenamedEvent(Guid TeamId, string OldName, string NewName) : IDomainEvent;
