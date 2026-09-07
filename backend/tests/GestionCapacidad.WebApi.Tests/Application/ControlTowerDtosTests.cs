using System.Text.Json;
using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class ControlTowerDtosTests
{
    [Fact]
    public void CapacityOverviewDto_SerializesWithTheContractPropertyNames()
    {
        var overview = new CapacityOverviewDto(
            ChapterFte: 12.5,
            BauFte: 5.0,
            TransformationFte: 4.0,
            FreeFte: 3.5,
            PeopleTotal: 18,
            PeopleUnassigned: 4,
            PeoplePartial: 3,
            SquadsAtCapacity: 2,
            SquadsWithoutTeam: 1,
            People:
            [
                new OverviewPersonDto(
                    Guid.NewGuid(), "María González", "Backend Dev", "Intermedio", 1.0,
                    new OverviewAllocationDto(Guid.NewGuid(), Guid.NewGuid(), "Backend Platform", 60m, 30m, 30m), 40m),
            ],
            Squads:
            [
                new OverviewSquadDto(Guid.NewGuid(), "Backend Platform", "High", 4, 3.0, 4.0, 1.5, 1.5),
            ]);

        string json = JsonSerializer.Serialize(overview, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        Assert.Contains("\"chapterFte\":12.5", json);
        Assert.Contains("\"bauFte\":5", json);
        Assert.Contains("\"transformationFte\":4", json);
        Assert.Contains("\"freeFte\":3.5", json);
        Assert.Contains("\"peopleUnassigned\":4", json);
        Assert.Contains("\"peoplePartial\":3", json);
        Assert.Contains("\"squadsAtCapacity\":2", json);
        Assert.Contains("\"squadsWithoutTeam\":1", json);
        Assert.Contains("\"marginPercentage\":40", json);
        Assert.Contains("\"teamAvailableFte\":4", json);
    }
}
