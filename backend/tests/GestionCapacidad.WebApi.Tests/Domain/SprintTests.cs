using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class SprintTests
{
    [Fact]
    public void Ctor_WithEndBeforeStart_Throws()
    {
        Assert.Throws<DomainException>(() =>
            new Sprint("S18", new DateOnly(2026, 8, 30), new DateOnly(2026, 8, 17), 0));
    }

    [Fact]
    public void Ctor_WithNegativeHolidays_Throws()
    {
        Assert.Throws<DomainException>(() =>
            new Sprint("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), -1));
    }

    [Fact]
    public void IsCurrent_TrueOnlyWithinRange()
    {
        var sprint = new Sprint("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), 1);

        Assert.True(sprint.IsCurrent(new DateOnly(2026, 8, 22)));
        Assert.True(sprint.IsCurrent(new DateOnly(2026, 8, 17)));
        Assert.True(sprint.IsCurrent(new DateOnly(2026, 8, 30)));
        Assert.False(sprint.IsCurrent(new DateOnly(2026, 8, 16)));
        Assert.False(sprint.IsCurrent(new DateOnly(2026, 8, 31)));
    }
}
