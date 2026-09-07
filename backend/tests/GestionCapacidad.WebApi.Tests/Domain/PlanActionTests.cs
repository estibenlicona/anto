using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class PlanActionTests
{
    private static PlanAction NewAction(int fromLevel = 2, int targetLevel = 3, string dueMonth = "2026-12") =>
        new(Guid.NewGuid(), Guid.NewGuid(), fromLevel, targetLevel, dueMonth, "Curso de SQL avanzado");

    [Fact]
    public void Ctor_NacesInProgress()
    {
        PlanAction action = NewAction();

        Assert.Equal(PlanActionStatus.InProgress, action.Status);
    }

    [Theory]
    [InlineData(2, 2)]
    [InlineData(3, 2)]
    public void Ctor_WithTargetLevelNotAboveFromLevel_Throws(int fromLevel, int targetLevel)
    {
        Assert.Throws<DomainException>(() => NewAction(fromLevel, targetLevel));
    }

    [Theory]
    [InlineData("26-12")]
    [InlineData("2026/12")]
    [InlineData("")]
    public void Ctor_WithInvalidDueMonth_Throws(string dueMonth)
    {
        // La forma es sólo AAAA-MM (mismo `MONTH` del mock: sin validar rango de mes),
        // así que "2026-13" no lanza — es la misma regla, no una laxitud nuestra.
        Assert.Throws<DomainException>(() => NewAction(dueMonth: dueMonth));
    }

    [Fact]
    public void Ctor_WithEmptyTitle_Throws()
    {
        Assert.Throws<DomainException>(() => new PlanAction(Guid.NewGuid(), Guid.NewGuid(), 2, 3, "2026-12", "   "));
    }

    [Fact]
    public void SetStatus_ChangesOnlyTheStatus()
    {
        PlanAction action = NewAction();

        action.SetStatus(PlanActionStatus.Done);

        Assert.Equal(PlanActionStatus.Done, action.Status);
        Assert.Equal(2, action.FromLevel);
        Assert.Equal(3, action.TargetLevel);
        Assert.Equal("2026-12", action.DueMonth);
    }
}
