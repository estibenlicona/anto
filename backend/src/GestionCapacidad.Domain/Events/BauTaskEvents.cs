using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Events;

public sealed record BauTaskCreatedEvent(Guid BauTaskId, Guid SquadId, string Name) : IDomainEvent;

public sealed record BauTaskRenamedEvent(Guid BauTaskId, string OldName, string NewName) : IDomainEvent;
