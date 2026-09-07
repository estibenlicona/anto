using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Events;

public sealed record PersonCreatedEvent(Guid PersonId, string Name) : IDomainEvent;

public sealed record PersonLevelChangedEvent(
    Guid PersonId,
    Level OldLevel,
    Level NewLevel) : IDomainEvent;

public sealed record PersonModalityChangedEvent(
    Guid PersonId,
    Modality OldModality,
    Modality NewModality) : IDomainEvent;

public sealed record PersonAssignedToChapterEvent(Guid PersonId, Guid ChapterId) : IDomainEvent;

public sealed record PersonRemovedFromChapterEvent(Guid PersonId) : IDomainEvent;

public sealed record PersonAssignedToExpertiseLineEvent(Guid PersonId, Guid ExpertiseLineId) : IDomainEvent;

public sealed record PersonRemovedFromExpertiseLineEvent(Guid PersonId) : IDomainEvent;
