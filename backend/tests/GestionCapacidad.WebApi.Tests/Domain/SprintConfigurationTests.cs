using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class SprintConfigurationTests
{
    private static SprintConfiguration Valid() =>
        new(weeks: 2, sprintsPerQuarter: 6, hoursPerSprint: 80m,
            sprintCloseTime: "23:00", historyWindowSprints: 6, minHistorySprints: 3);

    [Fact]
    public void Create_WithValidValues_KeepsThem()
    {
        SprintConfiguration config = Valid();

        Assert.Equal(2, config.Weeks);
        Assert.Equal(6, config.SprintsPerQuarter);
        Assert.Equal(80m, config.HoursPerSprint);
        Assert.Equal("23:00", config.SprintCloseTime);
        Assert.Equal(6, config.HistoryWindowSprints);
        Assert.Equal(3, config.MinHistorySprints);
    }

    [Theory]
    [InlineData(0, 6, 80, "23:00", 6, 3)]   // semanas por debajo
    [InlineData(5, 6, 80, "23:00", 6, 3)]   // semanas por encima
    [InlineData(2, 3, 80, "23:00", 6, 3)]   // sprints por quarter por debajo
    [InlineData(2, 9, 80, "23:00", 6, 3)]   // sprints por quarter por encima
    [InlineData(2, 6, 19, "23:00", 6, 3)]   // horas por debajo
    [InlineData(2, 6, 401, "23:00", 6, 3)]  // horas por encima
    [InlineData(2, 6, 80, "23:00", 2, 2)]   // ventana por debajo
    [InlineData(2, 6, 80, "23:00", 13, 3)]  // ventana por encima
    [InlineData(2, 6, 80, "23:00", 6, 1)]   // mínimo por debajo
    [InlineData(2, 6, 80, "23:00", 12, 7)]  // mínimo por encima
    public void Create_WithValueOutOfRange_Throws(
        int weeks, int sprintsPerQuarter, decimal hours, string closeTime, int window, int min)
    {
        Assert.Throws<DomainException>(() =>
            new SprintConfiguration(weeks, sprintsPerQuarter, hours, closeTime, window, min));
    }

    [Theory]
    [InlineData("24:00")]
    [InlineData("23:60")]
    [InlineData("7:00")]
    [InlineData("23h00")]
    [InlineData("")]
    public void Create_WithInvalidCloseTime_Throws(string closeTime)
    {
        var exception = Assert.Throws<DomainException>(() =>
            new SprintConfiguration(2, 6, 80m, closeTime, 6, 3));

        Assert.Contains("HH:mm", exception.Message);
    }

    [Theory]
    [InlineData("00:00")]
    [InlineData("09:30")]
    [InlineData("23:59")]
    public void Create_WithValidCloseTime_Accepts(string closeTime)
    {
        Assert.Equal(closeTime, new SprintConfiguration(2, 6, 80m, closeTime, 6, 3).SprintCloseTime);
    }

    [Fact]
    public void Create_WithMinAboveWindow_Throws()
    {
        var exception = Assert.Throws<DomainException>(() =>
            new SprintConfiguration(2, 6, 80m, "23:00", historyWindowSprints: 4, minHistorySprints: 6));

        Assert.Contains("ventana de histórico", exception.Message);
    }

    [Fact]
    public void Update_WithValidValues_ReplacesAndMarksUpdated()
    {
        SprintConfiguration config = Valid();

        config.Update(3, 4, 100m, "18:30", 10, 4);

        Assert.Equal(3, config.Weeks);
        Assert.Equal(100m, config.HoursPerSprint);
        Assert.Equal("18:30", config.SprintCloseTime);
        Assert.Equal(10, config.HistoryWindowSprints);
        Assert.NotNull(config.UpdatedAtUtc);
    }

    [Fact]
    public void Update_WithInvalidValues_LeavesThePreviousOnesIntact()
    {
        SprintConfiguration config = Valid();

        Assert.Throws<DomainException>(() => config.Update(2, 6, 500m, "23:00", 6, 3));

        Assert.Equal(80m, config.HoursPerSprint);
    }
}
