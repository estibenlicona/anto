using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class InitiativeTests
{
    private static Initiative Build(string name = "Kafka Migration") =>
        new(Guid.NewGuid(), name, InitiativeType.Transformation, 6);

    // ── Construction ──────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidData_StartsInEvaluation()
    {
        var initiative = Build();

        Assert.NotEqual(Guid.Empty, initiative.Id);
        Assert.Equal(InitiativeStatus.Evaluation, initiative.Status);
        Assert.Equal(InitiativeType.Transformation, initiative.Type);
        Assert.Equal(6, initiative.DeadlineMonths);
        Assert.False(initiative.BacklogDefined);
        Assert.False(initiative.ArchitectureDefined);
        Assert.False(initiative.EarlyStageCompleted);
    }

    [Fact]
    public void Create_RaisesInitiativeCreatedEvent()
    {
        var initiative = Build("My Initiative");

        var evt = Assert.Single(initiative.DomainEvents.OfType<InitiativeCreatedEvent>());
        Assert.Equal("My Initiative", evt.Name);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyName_ThrowsDomainException(string name)
    {
        Assert.Throws<DomainException>(() =>
            new Initiative(Guid.NewGuid(), name, InitiativeType.Transformation, 6));
    }

    [Fact]
    public void Create_WithEmptySquadId_ThrowsDomainException()
    {
        Assert.Throws<DomainException>(() =>
            new Initiative(Guid.Empty, "Name", InitiativeType.Transformation, 6));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_WithInvalidDeadline_ThrowsDomainException(int months)
    {
        Assert.Throws<DomainException>(() =>
            new Initiative(Guid.NewGuid(), "Name", InitiativeType.Transformation, months));
    }

    // ── Rename ────────────────────────────────────────────────────────────────

    [Fact]
    public void Rename_ChangesName_AndRaisesEvent()
    {
        var initiative = Build("Old Name");
        initiative.ClearDomainEvents();

        initiative.Rename("New Name");

        Assert.Equal("New Name", initiative.Name);
        var evt = Assert.Single(initiative.DomainEvents.OfType<InitiativeRenamedEvent>());
        Assert.Equal("Old Name", evt.OldName);
        Assert.Equal("New Name", evt.NewName);
    }

    // ── ChangeStatus ──────────────────────────────────────────────────────────

    [Fact]
    public void ChangeStatus_ToActive_RaisesEvent()
    {
        var initiative = Build();
        initiative.ClearDomainEvents();

        initiative.ChangeStatus(InitiativeStatus.Active);

        Assert.Equal(InitiativeStatus.Active, initiative.Status);
        var evt = Assert.Single(initiative.DomainEvents.OfType<InitiativeStatusChangedEvent>());
        Assert.Equal(InitiativeStatus.Evaluation, evt.OldStatus);
        Assert.Equal(InitiativeStatus.Active, evt.NewStatus);
    }

    [Fact]
    public void ChangeStatus_WithSameStatus_DoesNotRaiseEvent()
    {
        var initiative = Build();
        initiative.ClearDomainEvents();

        initiative.ChangeStatus(InitiativeStatus.Evaluation);

        Assert.Empty(initiative.DomainEvents);
    }

    [Fact]
    public void ChangeStatus_ToClosed_ChangesStatus()
    {
        var initiative = Build();
        initiative.ChangeStatus(InitiativeStatus.Active);
        initiative.ClearDomainEvents();

        initiative.ChangeStatus(InitiativeStatus.Closed);

        Assert.Equal(InitiativeStatus.Closed, initiative.Status);
    }

    // ── Prerequisites ─────────────────────────────────────────────────────────

    [Fact]
    public void MarkBacklogDefined_SetsFlag()
    {
        var initiative = Build();
        initiative.MarkBacklogDefined();
        Assert.True(initiative.BacklogDefined);
    }

    [Fact]
    public void MarkArchitectureDefined_SetsFlag()
    {
        var initiative = Build();
        initiative.MarkArchitectureDefined();
        Assert.True(initiative.ArchitectureDefined);
    }

    [Fact]
    public void MarkEarlyStageCompleted_SetsFlag()
    {
        var initiative = Build();
        initiative.MarkEarlyStageCompleted();
        Assert.True(initiative.EarlyStageCompleted);
    }

    // ── UpdateDeadline ────────────────────────────────────────────────────────

    [Fact]
    public void UpdateDeadline_WithValidMonths_ChangesDeadline()
    {
        var initiative = Build();
        initiative.UpdateDeadline(12);
        Assert.Equal(12, initiative.DeadlineMonths);
    }

    [Fact]
    public void UpdateDeadline_WithZero_ThrowsDomainException()
    {
        var initiative = Build();
        Assert.Throws<DomainException>(() => initiative.UpdateDeadline(0));
    }
}
