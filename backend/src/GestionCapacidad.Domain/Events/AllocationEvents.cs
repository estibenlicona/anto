using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Events;

public sealed record AllocationCreatedEvent(
    Guid AllocationId,
    Guid PersonId,
    Guid SquadId,
    int DedicationPercentage) : IDomainEvent;

public sealed record AllocationUpdatedEvent(
    Guid AllocationId,
    Guid PersonId,
    Guid SquadId,
    int OldDedication,
    int NewDedication) : IDomainEvent;
