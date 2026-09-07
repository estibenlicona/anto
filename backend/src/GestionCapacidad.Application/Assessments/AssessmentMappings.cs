using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Assessments;

/// <summary>
/// Arma el DTO de una evaluación: contra el catálogo vigente mientras está en
/// curso, contra el recorte congelado de cada habilidad cuando está cerrada
/// — así una evaluación cerrada no se mueve aunque el catálogo cambie
/// después.
/// </summary>
public static class AssessmentMappings
{
    private static readonly IReadOnlyList<IReadOnlyList<string>> EmptyMet =
        [Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>()];

    public static AssessmentDto ToDto(
        Assessment assessment,
        string personName,
        string position,
        IReadOnlyList<Skill> liveSkills,
        int liveCatalogVersion)
    {
        bool closed = assessment.Status == AssessmentStatus.Closed;

        IReadOnlyList<AssessmentSkillDto> skills = closed
            ? [.. assessment.Skills.Select(ToClosedSkillDto)]
            : [.. AssessmentSkillScope.Resolve(assessment, liveSkills)
                .Select(skill => ToLiveSkillDto(skill, assessment.Skills.FirstOrDefault(a => a.SkillId == skill.Id), position))];

        return new AssessmentDto(
            assessment.Id,
            assessment.PersonId,
            personName,
            position,
            assessment.Cycle,
            assessment.Status.Value,
            closed ? assessment.CatalogVersionAtClose ?? liveCatalogVersion : liveCatalogVersion,
            assessment.ClosedAtUtc,
            skills);
    }

    private static AssessmentSkillDto ToLiveSkillDto(Skill skill, AssessmentSkillAnswer? answer, string position)
    {
        int? level = answer?.Level;
        IReadOnlyList<IReadOnlyList<string>> met = answer?.Met ?? EmptyMet;
        string note = answer?.Note ?? string.Empty;

        int? expectedLevel = skill.Expectations
            .FirstOrDefault(e => string.Equals(e.Position, position, StringComparison.Ordinal))?.Level.Value;

        decimal? gap = ComputeGap(level, expectedLevel);

        IReadOnlyList<AssessmentLevelDto> levels =
        [
            .. skill.Levels.OrderBy(l => l.Level.Value)
                .Select(l => new AssessmentLevelDto(
                    l.Level.Value,
                    [.. l.Criteria.Select(text => new AssessmentCriterionDto(text, CriterionAt(met, l.Level.Value).Contains(text)))])),
        ];

        IReadOnlyList<string> missingCriteria = gap is > 0 && expectedLevel is int expected
            ? MissingAt(skill.Levels.OrderBy(l => l.Level.Value).Select(l => l.Criteria).ToList(), met, expected)
            : [];

        return new AssessmentSkillDto(skill.Id, skill.Name, skill.Group.Value, level, note, levels, expectedLevel, gap, missingCriteria);
    }

    private static AssessmentSkillDto ToClosedSkillDto(AssessmentSkillAnswer answer)
    {
        int? level = answer.Level;
        int? expectedLevel = answer.FrozenExpectedLevel;
        decimal? gap = ComputeGap(level, expectedLevel);
        IReadOnlyList<IReadOnlyList<string>> frozenLevels = answer.FrozenLevels ?? EmptyMet;

        IReadOnlyList<AssessmentLevelDto> levels =
        [
            .. Enumerable.Range(1, 4)
                .Select(l => new AssessmentLevelDto(
                    l,
                    [.. CriterionAt(frozenLevels, l).Select(text => new AssessmentCriterionDto(text, CriterionAt(answer.Met, l).Contains(text)))])),
        ];

        IReadOnlyList<string> missingCriteria = gap is > 0 && expectedLevel is int expected
            ? MissingAt(frozenLevels, answer.Met, expected)
            : [];

        return new AssessmentSkillDto(
            answer.SkillId,
            answer.FrozenSkillName ?? string.Empty,
            answer.FrozenGroup ?? string.Empty,
            level,
            answer.Note,
            levels,
            expectedLevel,
            gap,
            missingCriteria);
    }

    /// <summary>La brecha es la diferencia sólo cuando resta; sin nivel exigido o sin calificar, no hay brecha que medir.</summary>
    private static decimal? ComputeGap(int? level, int? expectedLevel) =>
        level is int achieved && expectedLevel is int expected ? Math.Max(0, expected - achieved) : null;

    private static IReadOnlyList<string> CriterionAt(IReadOnlyList<IReadOnlyList<string>> byLevel, int level) =>
        level is >= 1 and <= 4 && level - 1 < byLevel.Count ? byLevel[level - 1] : [];

    /// <summary>Sólo tiene sentido como contenido de una brecha abierta: los criterios del nivel exigido que quedaron sin marcar.</summary>
    private static IReadOnlyList<string> MissingAt(
        IReadOnlyList<IReadOnlyList<string>> criteriaByLevel, IReadOnlyList<IReadOnlyList<string>> metByLevel, int expectedLevel)
    {
        IReadOnlyList<string> expectedCriteria = CriterionAt(criteriaByLevel, expectedLevel);
        IReadOnlyList<string> marked = CriterionAt(metByLevel, expectedLevel);
        return [.. expectedCriteria.Where(c => !marked.Contains(c))];
    }
}
