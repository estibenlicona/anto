using System.Text.Json;
using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class PersonDetailDtosTests
{
    [Fact]
    public void PersonDetailDto_SerializesWithTheContractPropertyNames()
    {
        var person = new PersonDto(
            Guid.NewGuid(), "María González", "1036884001", "", "maria.gonzalez@tuya.com", "Backend Dev", "contributor",
            null, null, 0, 3, "Intermedio", "Intermediate", "Intermedio", "Hybrid", 1.0f, 6_000_000m,
            new DateOnly(2021, 3, 15), Guid.NewGuid(), null, DateTime.UtcNow, null, 80, []);

        var detail = new PersonDetailDto(
            Person: person,
            ProviderName: null,
            ContractEndsAt: null,
            ChapterName: "Core y Datos",
            ChapterLeadName: "Tomás Giraldo",
            ExpertiseLineName: "Backend",
            ExpertiseLineLeadName: "Carlos López",
            Allocation: new PersonDetailAllocationDto(
                Guid.NewGuid(), Guid.NewGuid(), "Backend Platform", "High", "Ecosistema Digital", "desc",
                ["Carlos López"], 80m, 50m, 30m, new DateOnly(2024, 1, 1), 3),
            DevOpsIdentity: new DevOpsIdentityDto(
                "u1", "maria.gonzalez@tuya.com", new DateOnly(2026, 9, 1),
                new CurrentSprintBalanceDto(
                    new SprintRefDto("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), "Provisional", null),
                    32m, 20m, 60.0m,
                    new CapacityDto(1.0m, 0.8m, new CapacityBreakdownDto(10m, 1m, 1m, 0m, 0m), 64, 16),
                    "PossibleOverload", null, 2)),
            Stacks: [new PersonStackDetailDto(".NET", 3, true, 2, [new PersonRefDto(Guid.NewGuid(), "Carlos López")])],
            CostReading: "InRange",
            SuggestedSquads: []);

        string json = JsonSerializer.Serialize(detail, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        Assert.Contains("\"chapterName\":\"Core y Datos\"", json);
        Assert.Contains("\"expertiseLineName\":\"Backend\"", json);
        Assert.Contains("\"dedicationPercentage\":80", json);
        Assert.Contains("\"otherCoverers\":2", json);
        Assert.Contains("\"evidenceCount\":2", json);
        Assert.Contains("\"costReading\":\"InRange\"", json);
    }

    [Fact]
    public void LinkDevOpsIdentityRequest_SerializesWithTheContractPropertyName()
    {
        var request = new LinkDevOpsIdentityRequest("u1");

        string json = JsonSerializer.Serialize(request, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        Assert.Contains("\"identityId\":\"u1\"", json);
    }
}
