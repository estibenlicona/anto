using GestionCapacidad.Application.CareerPlan;
using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class SpanSummaryCalculatorTests
{
    private static readonly SpanPendingDto EmptyPending = new(0, 0, 0, 0);

    private static SpanPersonDto Evaluated(string name, params (Guid SkillId, int? Level, int? ExpectedLevel)[] cells) =>
        new(Guid.NewGuid(), name, "Backend Dev", true,
            [.. cells.Select(c => new SpanCellDto(c.SkillId, c.Level, c.ExpectedLevel, Gap(c.Level, c.ExpectedLevel)))]);

    private static decimal? Gap(int? level, int? expected) =>
        level is int l && expected is int e ? Math.Max(0, e - l) : null;

    [Fact]
    public void TopSkills_WeighsByLevelsMissing_NotByHeadcount()
    {
        Guid skillA = Guid.NewGuid();
        Guid skillB = Guid.NewGuid();
        SpanSkillDto[] skills = [new(skillA, "Comunicación", "human"), new(skillB, "SQL", "technical")];

        // Skill A: tres personas, un nivel de brecha cada una → peso 3.
        // Skill B: dos personas, tres niveles de brecha cada una → peso 6.
        List<SpanPersonDto> people =
        [
            Evaluated("P1", (skillA, 2, 3)),
            Evaluated("P2", (skillA, 2, 3)),
            Evaluated("P3", (skillA, 2, 3)),
            Evaluated("P4", (skillB, 1, 4)),
            Evaluated("P5", (skillB, 1, 4)),
        ];

        var span = new SpanMatrixDto(skills, people);

        SpanSummaryDto summary = SpanSummaryCalculator.Compute(span, [], EmptyPending);

        Assert.Equal(2, summary.TopSkills.Count);
        Assert.Equal("SQL", summary.TopSkills[0].SkillName);
        Assert.Equal(6m, summary.TopSkills[0].Weight);
        Assert.Equal("Comunicación", summary.TopSkills[1].SkillName);
        Assert.Equal(3m, summary.TopSkills[1].Weight);
    }

    [Fact]
    public void CriticalGaps_CountsOnlyCellsWithTwoOrMoreLevelsMissing()
    {
        Guid skill = Guid.NewGuid();
        var span = new SpanMatrixDto(
            [new(skill, "SQL", "technical")],
            [Evaluated("P1", (skill, 2, 3)), Evaluated("P2", (skill, 1, 4))]);

        SpanSummaryDto summary = SpanSummaryCalculator.Compute(span, [], EmptyPending);

        Assert.Equal(2, summary.TotalGaps);
        Assert.Equal(1, summary.CriticalGaps);
    }

    [Fact]
    public void PeopleAtRisk_RequiresThreeOrMoreGaps()
    {
        Guid s1 = Guid.NewGuid();
        Guid s2 = Guid.NewGuid();
        Guid s3 = Guid.NewGuid();
        var span = new SpanMatrixDto(
            [new(s1, "A", "technical"), new(s2, "B", "technical"), new(s3, "C", "technical")],
            [Evaluated("Con Riesgo", (s1, 1, 2), (s2, 1, 2), (s3, 1, 2)), Evaluated("Sin Riesgo", (s1, 1, 2))]);

        SpanSummaryDto summary = SpanSummaryCalculator.Compute(span, [], EmptyPending);

        SpanPersonRefDto atRisk = Assert.Single(summary.PeopleAtRisk);
        Assert.Equal("Con Riesgo", atRisk.PersonName);
        Assert.Equal(3, atRisk.GapCount);
    }

    [Fact]
    public void PreviousCycle_IsNullWithFewerThanTwoTrendPoints()
    {
        var span = new SpanMatrixDto([], []);

        SpanSummaryDto summary = SpanSummaryCalculator.Compute(span, [new SpanCyclePointDto("2026-S1", 3)], EmptyPending);

        Assert.Null(summary.PreviousCycle);
    }

    [Fact]
    public void PreviousCycle_IsTheSecondToLastTrendPoint()
    {
        var span = new SpanMatrixDto([], []);
        List<SpanCyclePointDto> trend = [new("2025-S2", 5), new("2026-S1", 3)];

        SpanSummaryDto summary = SpanSummaryCalculator.Compute(span, trend, EmptyPending);

        Assert.Equal("2025-S2", summary.PreviousCycle!.Cycle);
    }
}
