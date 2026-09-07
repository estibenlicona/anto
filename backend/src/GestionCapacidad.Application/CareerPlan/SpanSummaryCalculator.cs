using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.CareerPlan;

/// <summary>
/// La lectura de situación del chapter: puerto literal de
/// <c>buildSpanSummary</c>. Los cuatro indicadores y las habilidades foco se
/// calculan sobre el <see cref="SpanMatrixDto"/> ya armado; la serie por
/// ciclo y los pendientes de gestión los arma quien llama (necesitan
/// evaluaciones de otros ciclos y las acciones del plan, que no viven acá).
/// </summary>
public static class SpanSummaryCalculator
{
    /// <summary>Cuántas habilidades entran al bloque de foco. Cuatro es lo que la columna sostiene sin volverse una lista.</summary>
    public const int TopSkillsCount = 4;

    public const int CriticalGapThreshold = 2;

    public const int AtRiskGapThreshold = 3;

    public static SpanSummaryDto Compute(SpanMatrixDto span, IReadOnlyList<SpanCyclePointDto> trend, SpanPendingDto pending)
    {
        List<(SpanPersonDto Person, List<SpanCellDto> Gaps)> withGaps =
        [
            .. span.People.Select(p => (p, Gaps: GapsOf(p))),
        ];

        List<SpanCellDto> allGaps = [.. withGaps.SelectMany(x => x.Gaps)];

        List<SpanPersonRefDto> peopleAtRisk =
        [
            .. withGaps
                .Select(x => new SpanPersonRefDto(x.Person.PersonId, x.Person.PersonName, x.Gaps.Count))
                .Where(p => p.GapCount >= AtRiskGapThreshold)
                .OrderByDescending(p => p.GapCount)
                .ThenBy(p => p.PersonName, StringComparer.Ordinal),
        ];

        List<SpanFocusSkillDto> topSkills =
        [
            .. span.Skills
                .Select(skill => BuildFocusSkill(skill, withGaps))
                .Where(s => s.Weight > 0m)
                .OrderByDescending(s => s.Weight)
                .ThenBy(s => s.SkillName, StringComparer.Ordinal)
                .Take(TopSkillsCount),
        ];

        SpanCyclePointDto? previousCycle = trend.Count >= 2 ? trend[^2] : null;

        return new SpanSummaryDto(
            allGaps.Count,
            allGaps.Count(c => (c.Gap ?? 0m) >= CriticalGapThreshold),
            span.People.Count(p => p.Evaluated),
            span.People.Count,
            peopleAtRisk,
            previousCycle,
            trend,
            topSkills,
            pending);
    }

    private static List<SpanCellDto> GapsOf(SpanPersonDto person) =>
        person.Evaluated ? [.. person.Cells.Where(c => c.Gap is > 0m)] : [];

    private static SpanFocusSkillDto BuildFocusSkill(SpanSkillDto skill, List<(SpanPersonDto Person, List<SpanCellDto> Gaps)> withGaps)
    {
        List<SpanCellDto> cells =
        [
            .. withGaps.Where(x => x.Person.Evaluated).SelectMany(x => x.Gaps).Where(c => c.SkillId == skill.SkillId),
        ];

        decimal weight = cells.Sum(c => c.Gap ?? 0m);
        int? expectedLevel = cells.Aggregate(
            (int?)null,
            (max, c) => c.ExpectedLevel is int level && (max is null || level > max) ? level : max);

        return new SpanFocusSkillDto(skill.SkillId, skill.SkillName, weight, cells.Count, expectedLevel);
    }
}
