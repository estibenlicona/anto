using System.Text.Json;
using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class AssessmentDtosTests
{
    [Fact]
    public void AssessmentDto_SerializesWithTheContractPropertyNames()
    {
        var dto = new AssessmentDto(
            Id: Guid.NewGuid(),
            PersonId: Guid.NewGuid(),
            PersonName: "Paula Ramírez",
            Position: "Data Engineer",
            Cycle: "2026-S1",
            Status: "InProgress",
            CatalogVersion: 3,
            ClosedAtUtc: null,
            Skills:
            [
                new AssessmentSkillDto(
                    SkillId: Guid.NewGuid(),
                    SkillName: "SQL",
                    Group: "technical",
                    Level: 2,
                    Note: "nota",
                    Levels: [new AssessmentLevelDto(1, [new AssessmentCriterionDto("A", true)])],
                    ExpectedLevel: 3,
                    Gap: 1m,
                    MissingCriteria: ["B"]),
            ]);

        string json = JsonSerializer.Serialize(dto, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        });

        Assert.Contains("\"catalogVersion\":3", json);
        Assert.Contains("\"closedAtUtc\":null", json);
        Assert.Contains("\"expectedLevel\":3", json);
        Assert.Contains("\"missingCriteria\":[\"B\"]", json);
        Assert.Contains("\"levels\":[", json);
        Assert.Contains("\"criteria\":[{\"text\":\"A\",\"met\":true}]", json);
        Assert.Contains("\"gap\":1", json);
    }
}
