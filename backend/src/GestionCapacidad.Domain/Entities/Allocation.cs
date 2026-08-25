using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

public sealed class Allocation : AggregateRoot
{
    private Allocation()
    {
    }

    public Allocation(
        Guid personId,
        Guid squadId,
        Guid? initiativeId,
        Percentage dedicationPercentage,
        Percentage bauPercentage,
        Percentage transformationPercentage)
    {
        if (personId == Guid.Empty)
            throw new DomainException("Person ID must not be empty.");

        if (squadId == Guid.Empty)
            throw new DomainException("Squad ID must not be empty.");

        ValidateDedicationBreakdown(dedicationPercentage, bauPercentage, transformationPercentage);

        PersonId                 = personId;
        SquadId                  = squadId;
        InitiativeId             = initiativeId;
        DedicationPercentage     = dedicationPercentage;
        BauPercentage            = bauPercentage;
        TransformationPercentage = transformationPercentage;

        AddDomainEvent(new AllocationCreatedEvent(Id, PersonId, SquadId, DedicationPercentage.Value));
    }

    public Guid PersonId { get; private set; }

    public Guid SquadId { get; private set; }

    public Guid? InitiativeId { get; private set; }

    public Percentage DedicationPercentage { get; private set; } = Percentage.Zero;

    public Percentage BauPercentage { get; private set; } = Percentage.Zero;

    public Percentage TransformationPercentage { get; private set; } = Percentage.Zero;

    // ── UpdateDedication ──────────────────────────────────────────────────────

    public void UpdateDedication(
        Percentage dedicationPercentage,
        Percentage bauPercentage,
        Percentage transformationPercentage,
        Guid? initiativeId = null)
    {
        ValidateDedicationBreakdown(dedicationPercentage, bauPercentage, transformationPercentage);

        var oldDedication = DedicationPercentage.Value;

        DedicationPercentage     = dedicationPercentage;
        BauPercentage            = bauPercentage;
        TransformationPercentage = transformationPercentage;
        InitiativeId             = initiativeId;

        MarkUpdated();
        AddDomainEvent(new AllocationUpdatedEvent(Id, PersonId, SquadId, oldDedication, DedicationPercentage.Value));
    }

    // ── Private guards ────────────────────────────────────────────────────────

    private static void ValidateDedicationBreakdown(
        Percentage dedication,
        Percentage bau,
        Percentage transformation)
    {
        if (dedication.Value < 1)
            throw new DomainException("Dedication percentage must be at least 1%.");

        if (bau.Value + transformation.Value != dedication.Value)
            throw new DomainException(
                $"BAU ({bau.Value}%) + Transformation ({transformation.Value}%) must equal Dedication ({dedication.Value}%).");
    }
}
