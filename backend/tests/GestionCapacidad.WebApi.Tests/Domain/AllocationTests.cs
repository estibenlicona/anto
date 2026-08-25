using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Events;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class PercentageTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(50)]
    [InlineData(100)]
    public void From_WithValidValue_Succeeds(int value)
    {
        Assert.Equal(value, Percentage.From(value).Value);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public void From_WithOutOfRange_ThrowsDomainException(int value)
    {
        Assert.Throws<DomainException>(() => Percentage.From(value));
    }

    [Fact]
    public void TwoInstances_WithSameValue_AreEqual()
    {
        Assert.Equal(Percentage.From(50), Percentage.From(50));
    }

    [Fact]
    public void ToString_IncludesPercentSign()
    {
        Assert.Equal("50%", Percentage.From(50).ToString());
    }
}

public sealed class AllocationTests
{
    private static Allocation Build(int dedication = 80, int bau = 30, int transformation = 50) =>
        new(Guid.NewGuid(), Guid.NewGuid(), null,
            Percentage.From(dedication),
            Percentage.From(bau),
            Percentage.From(transformation));

    [Fact]
    public void Create_WithValidData_Succeeds()
    {
        var allocation = Build();

        Assert.NotEqual(Guid.Empty, allocation.Id);
        Assert.Equal(80, allocation.DedicationPercentage.Value);
        Assert.Equal(30, allocation.BauPercentage.Value);
        Assert.Equal(50, allocation.TransformationPercentage.Value);
        Assert.Null(allocation.InitiativeId);
    }

    [Fact]
    public void Create_RaisesAllocationCreatedEvent()
    {
        var allocation = Build();

        var evt = Assert.Single(allocation.DomainEvents.OfType<AllocationCreatedEvent>());
        Assert.Equal(80, evt.DedicationPercentage);
    }

    [Fact]
    public void Create_WithEmptyPersonId_ThrowsDomainException()
    {
        Assert.Throws<DomainException>(() =>
            new Allocation(Guid.Empty, Guid.NewGuid(), null,
                Percentage.From(100), Percentage.From(50), Percentage.From(50)));
    }

    [Fact]
    public void Create_WhenBauPlusTransformationDoesNotEqualDedication_ThrowsDomainException()
    {
        // 30 + 40 = 70, but dedication = 80 → invalid
        Assert.Throws<DomainException>(() =>
            new Allocation(Guid.NewGuid(), Guid.NewGuid(), null,
                Percentage.From(80), Percentage.From(30), Percentage.From(40)));
    }

    [Fact]
    public void Create_WithZeroDedication_ThrowsDomainException()
    {
        Assert.Throws<DomainException>(() =>
            new Allocation(Guid.NewGuid(), Guid.NewGuid(), null,
                Percentage.From(0), Percentage.From(0), Percentage.From(0)));
    }

    [Fact]
    public void Create_WithOptionalInitiativeId_Succeeds()
    {
        var initiativeId = Guid.NewGuid();
        var allocation = new Allocation(Guid.NewGuid(), Guid.NewGuid(), initiativeId,
            Percentage.From(80), Percentage.From(30), Percentage.From(50));

        Assert.Equal(initiativeId, allocation.InitiativeId);
    }

    [Fact]
    public void UpdateDedication_WithValidValues_ChangesFields()
    {
        var allocation = Build(80, 30, 50);
        allocation.ClearDomainEvents();

        allocation.UpdateDedication(Percentage.From(100), Percentage.From(40), Percentage.From(60));

        Assert.Equal(100, allocation.DedicationPercentage.Value);
        Assert.Equal(40, allocation.BauPercentage.Value);
        Assert.Equal(60, allocation.TransformationPercentage.Value);
        Assert.NotNull(allocation.UpdatedAtUtc);
    }

    [Fact]
    public void UpdateDedication_RaisesAllocationUpdatedEvent()
    {
        var allocation = Build(80, 30, 50);
        allocation.ClearDomainEvents();

        allocation.UpdateDedication(Percentage.From(100), Percentage.From(60), Percentage.From(40));

        var evt = Assert.Single(allocation.DomainEvents.OfType<AllocationUpdatedEvent>());
        Assert.Equal(80, evt.OldDedication);
        Assert.Equal(100, evt.NewDedication);
    }

    [Fact]
    public void UpdateDedication_WhenBreakdownMismatch_ThrowsDomainException()
    {
        var allocation = Build();

        Assert.Throws<DomainException>(() =>
            allocation.UpdateDedication(Percentage.From(80), Percentage.From(50), Percentage.From(50)));
    }
}
