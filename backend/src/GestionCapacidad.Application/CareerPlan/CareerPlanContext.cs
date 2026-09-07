using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.CareerPlan;

/// <summary>
/// Lo que el span y el perfil necesitan sin volver a tocar un catálogo o
/// evaluaciones dispersas: las habilidades activas, todas las personas y la
/// evaluación cerrada más reciente de cada una. Se construye una vez por
/// request, como <c>DedicationContext</c>.
///
/// El nivel exigido siempre se resuelve contra el catálogo y el cargo
/// <b>vigentes</b> — nunca contra lo que la evaluación congeló al cerrar
/// (<see cref="AssessmentSkillAnswer.FrozenExpectedLevel"/>, que es lo que
/// usa la evaluación en sí). Es la diferencia deliberada con Evaluaciones —
/// ver design.md, decisión 3.
/// </summary>
public sealed class CareerPlanContext
{
    private static readonly IReadOnlyList<string> EmptyCriteria = [];

    private readonly IReadOnlyDictionary<Guid, Skill> _skillsById;
    private readonly IReadOnlyDictionary<Guid, Person> _peopleById;
    private readonly IReadOnlyDictionary<Guid, Assessment> _latestClosedByPerson;
    private readonly IReadOnlyList<Assessment> _allAssessments;

    private CareerPlanContext(
        IReadOnlyList<Person> people,
        IReadOnlyList<Skill> activeSkills,
        IReadOnlyDictionary<Guid, Skill> skillsById,
        IReadOnlyDictionary<Guid, Assessment> latestClosedByPerson,
        IReadOnlyList<Assessment> allAssessments)
    {
        People = people;
        ActiveSkills = activeSkills;
        _skillsById = skillsById;
        _peopleById = people.ToDictionary(p => p.Id);
        _latestClosedByPerson = latestClosedByPerson;
        _allAssessments = allAssessments;
    }

    public static async Task<CareerPlanContext> BuildAsync(
        IPersonRepository personRepository,
        ISkillRepository skillRepository,
        IAssessmentRepository assessmentRepository,
        CancellationToken cancellationToken)
    {
        IReadOnlyList<Person> people = await personRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Skill> allSkills = await skillRepository.GetAllAsync(cancellationToken);
        IReadOnlyList<Assessment> allAssessments = await assessmentRepository.GetAllAsync(cancellationToken);

        // La cerrada más reciente por persona: la del ciclo más alto, no la
        // última del arreglo — el ciclo se compara como texto porque su
        // forma AAAA-SN ya ordena así.
        Dictionary<Guid, Assessment> latestClosed = allAssessments
            .Where(a => a.Status == AssessmentStatus.Closed)
            .GroupBy(a => a.PersonId)
            .ToDictionary(g => g.Key, g => g.OrderBy(a => a.Cycle, StringComparer.Ordinal).Last());

        return new CareerPlanContext(
            people,
            [.. allSkills.Where(s => s.Active)],
            allSkills.ToDictionary(s => s.Id),
            latestClosed,
            allAssessments);
    }

    public IReadOnlyList<Person> People { get; }

    /// <summary>Sólo las activas: una habilidad retirada del catálogo no es algo sobre lo que actuar hoy.</summary>
    public IReadOnlyList<Skill> ActiveSkills { get; }

    /// <summary>Los ciclos cerrados que existen, del más viejo al más nuevo.</summary>
    public IReadOnlyList<string> ClosedCycles =>
        [.. _allAssessments.Where(a => a.Status == AssessmentStatus.Closed).Select(a => a.Cycle).Distinct().OrderBy(c => c, StringComparer.Ordinal)];

    public SpanMatrixDto BuildSpan()
    {
        List<SpanPersonDto> rows = [];
        foreach (Person person in People)
        {
            _latestClosedByPerson.TryGetValue(person.Id, out Assessment? assessment);

            List<SpanCellDto> cells = [];
            foreach (Skill skill in ActiveSkills)
            {
                AssessmentSkillAnswer? answer = assessment?.Skills.FirstOrDefault(s => s.SkillId == skill.Id);
                int? level = answer?.Level;
                int? expectedLevel = ExpectedLevelFor(skill, person.Position);
                decimal? gap = Gap(level, expectedLevel);

                cells.Add(new SpanCellDto(skill.Id, level, expectedLevel, gap));
            }

            rows.Add(new SpanPersonDto(person.Id, person.Name, person.Position, assessment is not null, cells));
        }

        return new SpanMatrixDto(
            [.. ActiveSkills.Select(s => new SpanSkillDto(s.Id, s.Name, s.Group.Value))],
            rows);
    }

    public PersonPlanDto BuildPlan(Person person, IReadOnlyList<PlanAction> actions)
    {
        _latestClosedByPerson.TryGetValue(person.Id, out Assessment? assessment);

        List<PlanSkillDto> skills = [];
        if (assessment is not null)
        {
            foreach (AssessmentSkillAnswer answer in assessment.Skills)
            {
                if (answer.Level is not int level)
                {
                    continue;
                }

                Skill? catalogSkill = _skillsById.GetValueOrDefault(answer.SkillId);
                int? expectedLevel = catalogSkill is null
                    ? null
                    : ExpectedLevelFor(catalogSkill, person.Position);
                decimal? gap = Gap(level, expectedLevel);

                IReadOnlyList<IReadOnlyList<string>> frozenLevels = answer.FrozenLevels ?? [EmptyCriteria, EmptyCriteria, EmptyCriteria, EmptyCriteria];
                IReadOnlyList<string> metCriteria = CriterionAt(answer.Met, level);
                bool hasGap = gap is > 0 && expectedLevel is not null;
                IReadOnlyList<string> missingCriteria = hasGap
                    ? [.. CriterionAt(frozenLevels, expectedLevel!.Value).Except(CriterionAt(answer.Met, expectedLevel.Value))]
                    : [];

                skills.Add(new PlanSkillDto(
                    answer.SkillId,
                    answer.FrozenSkillName ?? string.Empty,
                    answer.FrozenGroup ?? string.Empty,
                    level,
                    expectedLevel,
                    gap,
                    metCriteria,
                    CriterionAt(frozenLevels, level).Count,
                    missingCriteria,
                    hasGap ? CriterionAt(frozenLevels, expectedLevel!.Value).Count : 0,
                    answer.Note));
            }
        }

        List<PlanActionDto> actionDtos =
        [
            .. actions.Select(a => new PlanActionDto(
                a.Id,
                a.PersonId,
                a.SkillId,
                skills.FirstOrDefault(s => s.SkillId == a.SkillId)?.SkillName
                    ?? _skillsById.GetValueOrDefault(a.SkillId)?.Name
                    ?? string.Empty,
                a.FromLevel,
                a.TargetLevel,
                a.DueMonth,
                a.Title,
                a.Status.Value)),
        ];

        return new PersonPlanDto(
            person.Id, person.Name, person.Position, assessment?.ClosedAtUtc, assessment?.Cycle, skills, actionDtos);
    }

    /// <summary>
    /// Las brechas de un ciclo cerrado: una evaluación por persona (la última
    /// si hubiera más de una), sólo habilidades activas hoy, comparadas
    /// contra el cargo de la persona y la exigencia de hoy — nunca la de
    /// entonces. Ver design.md, decisión 5.
    /// </summary>
    public int GapsInCycle(string cycle)
    {
        Dictionary<Guid, Assessment> closedThisCycle = _allAssessments
            .Where(a => a.Status == AssessmentStatus.Closed && a.Cycle == cycle)
            .GroupBy(a => a.PersonId)
            .ToDictionary(g => g.Key, g => g.Last());

        int total = 0;
        foreach ((Guid personId, Assessment assessment) in closedThisCycle)
        {
            if (!_peopleById.TryGetValue(personId, out Person? person))
            {
                continue;
            }

            foreach (AssessmentSkillAnswer answer in assessment.Skills)
            {
                if (answer.Level is not int level)
                {
                    continue;
                }

                Skill? skill = _skillsById.GetValueOrDefault(answer.SkillId);
                if (skill is null || !skill.Active)
                {
                    continue;
                }

                int? expected = ExpectedLevelFor(skill, person.Position);
                if (expected is int e && e - level > 0)
                {
                    total++;
                }
            }
        }

        return total;
    }

    private static int? ExpectedLevelFor(Skill skill, string position) =>
        skill.Expectations.FirstOrDefault(e => string.Equals(e.Position, position, StringComparison.Ordinal))?.Level.Value;

    private static decimal? Gap(int? level, int? expectedLevel) =>
        level is int achieved && expectedLevel is int expected ? Math.Max(0, expected - achieved) : null;

    private static IReadOnlyList<string> CriterionAt(IReadOnlyList<IReadOnlyList<string>> byLevel, int level) =>
        level is >= 1 and <= 4 && level - 1 < byLevel.Count ? byLevel[level - 1] : EmptyCriteria;
}
