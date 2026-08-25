using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Events;

public sealed record PersonCreatedEvent(Guid PersonId, string Name) : IDomainEvent;

public sealed record PersonSeniorityChangedEvent(
    Guid PersonId,
    Seniority OldSeniority,
    Seniority NewSeniority) : IDomainEvent;

public sealed record PersonModalityChangedEvent(
    Guid PersonId,
    Modality OldModality,
    Modality NewModality) : IDomainEvent;

public sealed record PersonAssignedToChapterEvent(Guid PersonId, Guid ChapterId) : IDomainEvent;

public sealed record PersonRemovedFromChapterEvent(Guid PersonId) : IDomainEvent;
