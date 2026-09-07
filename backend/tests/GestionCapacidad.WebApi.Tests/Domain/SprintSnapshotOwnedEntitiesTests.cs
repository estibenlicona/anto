using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class ConcurrentInitiativeSnapshotTests
{
    [Fact]
    public void Ctor_StoresTheGivenValues()
    {
        var initiative = new ConcurrentInitiativeSnapshot("ep-kafka", "Migración Kafka", "ini-kafka", "Kafka Migration", 12m);

        Assert.Equal("ep-kafka", initiative.EpicId);
        Assert.Equal("Kafka Migration", initiative.InitiativeName);
        Assert.Equal(12m, initiative.Points);
    }

    [Fact]
    public void Ctor_WithUnmappedEpic_LeavesInitiativeFieldsNull()
    {
        var initiative = new ConcurrentInitiativeSnapshot("ep-x", "Épica sin mapear", null, null, 5m);

        Assert.Null(initiative.InitiativeId);
        Assert.Null(initiative.InitiativeName);
    }
}

public sealed class WorkItemSnapshotTests
{
    [Fact]
    public void Ctor_StoresTheGivenValues()
    {
        var item = new WorkItemSnapshot(
            "wi-1", 1001, "Implementar X", WorkItemTag.Initiative, "ep-1", "Épica", "ini-1", "Iniciativa",
            8m, "Closed", addedAfterSprintStart: true, "Board 1", "https://dev.azure.com/wi-1");

        Assert.Equal(1001, item.Number);
        Assert.Equal(WorkItemTag.Initiative, item.Tag);
        Assert.True(item.AddedAfterSprintStart);
    }
}

public sealed class ActivityDaySnapshotTests
{
    [Fact]
    public void Ctor_StoresTheGivenValues()
    {
        var day = new ActivityDaySnapshot(new DateOnly(2026, 8, 18), 3, 1, 0);

        Assert.Equal(3, day.Commits);
        Assert.Equal(1, day.Releases);
        Assert.Equal(0, day.Features);
    }
}
