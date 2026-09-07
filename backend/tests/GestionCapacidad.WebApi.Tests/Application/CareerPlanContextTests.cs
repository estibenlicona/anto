using GestionCapacidad.Application.CareerPlan;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Tests.SharedKernel;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class CareerPlanContextTests
{
    private readonly Mock<IPersonRepository> _people = new();
    private readonly Mock<ISkillRepository> _skills = new();
    private readonly Mock<IAssessmentRepository> _assessments = new();

    private static Skill NewSkill(string name = "SQL", int? expectedLevel = 3, string position = "Backend Dev")
    {
        var skill = new Skill(name, SkillGroup.Technical, "Consultas y modelado relacional.");
        skill.ReplaceCriteria(1, ["Escribe select simples con filtros."]);
        skill.ReplaceCriteria(2, ["Escribe joins entre varias tablas."]);
        skill.ReplaceCriteria(3, ["Optimiza consultas lentas con índices."]);
        if (expectedLevel is int level)
        {
            skill.SetExpectation(position, level);
        }

        return skill;
    }

    private Task<CareerPlanContext> BuildAsync(IReadOnlyList<Person> people, IReadOnlyList<Skill> skills, IReadOnlyList<Assessment> assessments)
    {
        _people.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(people);
        _skills.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(skills);
        _assessments.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(assessments);

        return CareerPlanContext.BuildAsync(_people.Object, _skills.Object, _assessments.Object, CancellationToken.None);
    }

    [Fact]
    public async Task BuildSpan_PersonWithoutClosedAssessment_HasNullLevelAndIsNotEvaluated()
    {
        Person person = TestDataFactory.CreatePerson(name: "Sin Evaluar", position: "Backend Dev");
        Skill skill = NewSkill();

        CareerPlanContext context = await BuildAsync([person], [skill], []);

        SpanMatrixDto span = context.BuildSpan();

        SpanPersonDto row = Assert.Single(span.People);
        Assert.False(row.Evaluated);
        SpanCellDto cell = Assert.Single(row.Cells);
        Assert.Null(cell.Level);
        Assert.Null(cell.Gap);
    }

    [Fact]
    public async Task BuildPlan_PersonWithoutClosedAssessment_HasEmptySkillsAndNullCycle()
    {
        Person person = TestDataFactory.CreatePerson(name: "Sin Evaluar", position: "Backend Dev");
        Skill skill = NewSkill();

        CareerPlanContext context = await BuildAsync([person], [skill], []);

        PersonPlanDto plan = context.BuildPlan(person, []);

        Assert.Empty(plan.Skills);
        Assert.Null(plan.Cycle);
        Assert.Null(plan.AssessmentClosedAtUtc);
    }

    [Fact]
    public async Task ExpectedLevel_IsAlwaysTodays_NeverTheFrozenOne()
    {
        Person person = TestDataFactory.CreatePerson(name: "María", position: "Backend Dev");
        Skill skill = NewSkill(expectedLevel: 2);

        var assessment = new Assessment(person.Id, "2026-S1");
        assessment.SaveSkill(skill.Id, 2, [[], ["Escribe joins entre varias tablas."], [], []], "", expectedLevel: 2);
        assessment.Close(
            new Dictionary<Guid, (string, string, IReadOnlyList<IReadOnlyList<string>>, int?)>
            {
                [skill.Id] = ("SQL", "technical", [.. skill.Levels.OrderBy(l => l.Level.Value).Select(l => l.Criteria)], 2),
            },
            1, DateTime.UtcNow);

        // El catálogo sube la exigencia después de cerrar.
        skill.SetExpectation("Backend Dev", 4);

        CareerPlanContext context = await BuildAsync([person], [skill], [assessment]);

        SpanMatrixDto span = context.BuildSpan();
        Assert.Equal(4, Assert.Single(span.People).Cells[0].ExpectedLevel);
        Assert.Equal(2m, Assert.Single(span.People).Cells[0].Gap);

        PersonPlanDto plan = context.BuildPlan(person, []);
        PlanSkillDto planSkill = Assert.Single(plan.Skills);
        Assert.Equal(4, planSkill.ExpectedLevel);
        Assert.Equal(2m, planSkill.Gap);
    }

    [Fact]
    public async Task BuildPlan_SkillEvaluatedThenDeactivated_StaysInThePlanButNotInTheMatrix()
    {
        Person person = TestDataFactory.CreatePerson(name: "María", position: "Backend Dev");
        Skill skill = NewSkill(expectedLevel: 2);

        var assessment = new Assessment(person.Id, "2026-S1");
        assessment.SaveSkill(skill.Id, 2, [[], ["Escribe joins entre varias tablas."], [], []], "", expectedLevel: 2);
        assessment.Close(
            new Dictionary<Guid, (string, string, IReadOnlyList<IReadOnlyList<string>>, int?)>
            {
                [skill.Id] = ("SQL", "technical", [.. skill.Levels.OrderBy(l => l.Level.Value).Select(l => l.Criteria)], 2),
            },
            1, DateTime.UtcNow);

        skill.SetActive(false);

        CareerPlanContext context = await BuildAsync([person], [skill], [assessment]);

        SpanMatrixDto span = context.BuildSpan();
        Assert.Empty(span.Skills);

        PersonPlanDto plan = context.BuildPlan(person, []);
        Assert.Single(plan.Skills);
    }

    [Fact]
    public async Task GapsInCycle_ComparesAgainstTodaysExpectation_NotTheOneFromThatCycle()
    {
        Person person = TestDataFactory.CreatePerson(name: "María", position: "Backend Dev");
        Skill skill = NewSkill(expectedLevel: 2);

        var assessment = new Assessment(person.Id, "2026-S1");
        assessment.SaveSkill(skill.Id, 2, [[], ["Escribe joins entre varias tablas."], [], []], "", expectedLevel: 2);
        assessment.Close(
            new Dictionary<Guid, (string, string, IReadOnlyList<IReadOnlyList<string>>, int?)>
            {
                [skill.Id] = ("SQL", "technical", [.. skill.Levels.OrderBy(l => l.Level.Value).Select(l => l.Criteria)], 2),
            },
            1, DateTime.UtcNow);

        // No tenía brecha al cerrar (nivel 2 = exigido 2), pero el catálogo subió la exigencia después.
        skill.SetExpectation("Backend Dev", 4);

        CareerPlanContext context = await BuildAsync([person], [skill], [assessment]);

        Assert.Equal(["2026-S1"], context.ClosedCycles);
        Assert.Equal(1, context.GapsInCycle("2026-S1"));
    }
}
