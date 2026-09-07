using System.Text.Json;
using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class CareerPlanDtosTests
{
    private static readonly JsonSerializerOptions Options = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    [Fact]
    public void SpanSummaryDto_SerializesWithTheContractPropertyNames()
    {
        var summary = new SpanSummaryDto(
            TotalGaps: 5,
            CriticalGaps: 2,
            EvaluatedPeople: 10,
            TotalPeople: 12,
            PeopleAtRisk: [new SpanPersonRefDto(Guid.NewGuid(), "María González", 3)],
            PreviousCycle: new SpanCyclePointDto("2026-S1", 4),
            Trend: [new SpanCyclePointDto("2026-S1", 4), new SpanCyclePointDto("2026-S2", 5)],
            TopSkills: [new SpanFocusSkillDto(Guid.NewGuid(), "SQL", 4m, 2, 3)],
            Pending: new SpanPendingDto(2, 1, 1, 3));

        string json = JsonSerializer.Serialize(summary, Options);

        Assert.Contains("\"totalGaps\":5", json);
        Assert.Contains("\"criticalGaps\":2", json);
        Assert.Contains("\"peopleWithGap\":2", json);
        Assert.Contains("\"positionsWithoutLevel\":1", json);
        Assert.Contains("\"gapsWithoutPlan\":3", json);
        Assert.Contains("\"gapCount\":3", json);
        Assert.Contains("\"expectedLevel\":3", json);
    }

    [Fact]
    public void PersonPlanDto_SerializesWithTheContractPropertyNames()
    {
        var plan = new PersonPlanDto(
            PersonId: Guid.NewGuid(),
            PersonName: "María González",
            Position: "Backend Dev",
            AssessmentClosedAtUtc: DateTime.UtcNow,
            Cycle: "2026-S1",
            Skills:
            [
                new PlanSkillDto(
                    Guid.NewGuid(), "SQL", "technical", 2, 3, 1m,
                    ["Escribe select simples con filtros."], 1, ["Escribe joins entre varias tablas."], 2, "Le falta profundidad."),
            ],
            Actions:
            [
                new PlanActionDto(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), "SQL", 2, 3, "2026-12", "Curso avanzado", "InProgress"),
            ]);

        string json = JsonSerializer.Serialize(plan, Options);

        Assert.Contains("\"assessmentClosedAtUtc\":", json);
        Assert.Contains("\"expectedLevel\":3", json);
        Assert.Contains("\"metCriteria\":", json);
        Assert.Contains("\"levelTotal\":1", json);
        Assert.Contains("\"missingCriteria\":", json);
        Assert.Contains("\"expectedTotal\":2", json);
        Assert.Contains("\"fromLevel\":2", json);
        Assert.Contains("\"targetLevel\":3", json);
        Assert.Contains("\"dueMonth\":\"2026-12\"", json);
    }
}
