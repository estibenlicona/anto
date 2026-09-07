using GestionCapacidad.Application.Assessments;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class AssessmentMappingsTests
{
    private static readonly Guid PersonId = Guid.NewGuid();

    private static Skill NewSqlSkill()
    {
        var skill = new Skill("SQL", SkillGroup.Technical, "d");
        skill.ReplaceCriteria(2, ["Escribe joins", "Normaliza tablas"]);
        skill.ReplaceCriteria(3, ["Optimiza consultas"]);
        skill.SetExpectation("Data Engineer", 3);
        return skill;
    }

    [Fact]
    public void ToDto_InProgress_ReflectsALiveCatalogChange()
    {
        Skill skill = NewSqlSkill();
        var assessment = new Assessment(PersonId, "2026-S1");
        assessment.SaveSkill(skill.Id, 2, [[], ["Escribe joins"], [], []], "nota", expectedLevel: 3);

        AssessmentDto before = AssessmentMappings.ToDto(assessment, "Paula", "Data Engineer", [skill], liveCatalogVersion: 1);

        // El catálogo cambia después de calificar: se agrega un criterio nuevo al nivel 2.
        skill.ReplaceCriteria(2, ["Escribe joins", "Normaliza tablas", "Nuevo criterio"]);
        AssessmentDto after = AssessmentMappings.ToDto(assessment, "Paula", "Data Engineer", [skill], liveCatalogVersion: 2);

        AssessmentSkillDto skillBefore = before.Skills.Single();
        AssessmentSkillDto skillAfter = after.Skills.Single();
        Assert.Equal(2, skillBefore.Levels.Single(l => l.Level == 2).Criteria.Count);
        Assert.Equal(3, skillAfter.Levels.Single(l => l.Level == 2).Criteria.Count);
    }

    [Fact]
    public void ToDto_Closed_DoesNotMove_EvenIfTheCatalogChangesLater()
    {
        Skill skill = NewSqlSkill();
        var assessment = new Assessment(PersonId, "2026-S1");
        assessment.SaveSkill(skill.Id, 2, [[], ["Escribe joins"], [], []], "nota", expectedLevel: 3);
        assessment.Close(FreezeFrom([skill], "Data Engineer"), catalogVersion: 1, DateTime.UtcNow);

        skill.ReplaceCriteria(2, ["Escribe joins", "Normaliza tablas", "Nuevo criterio"]);
        AssessmentDto dto = AssessmentMappings.ToDto(assessment, "Paula", "Data Engineer", [skill], liveCatalogVersion: 5);

        AssessmentSkillDto skillDto = dto.Skills.Single();
        Assert.Equal(2, skillDto.Levels.Single(l => l.Level == 2).Criteria.Count);
        Assert.Equal(1, dto.CatalogVersion);
    }

    [Fact]
    public void ToDto_WithoutGap_MissingCriteriaIsEmpty()
    {
        Skill skill = NewSqlSkill();
        var assessment = new Assessment(PersonId, "2026-S1");
        assessment.SaveSkill(skill.Id, 3, [], "", expectedLevel: 3);

        AssessmentDto dto = AssessmentMappings.ToDto(assessment, "Paula", "Data Engineer", [skill], liveCatalogVersion: 1);

        Assert.Empty(dto.Skills.Single().MissingCriteria);
        Assert.Equal(0m, dto.Skills.Single().Gap);
    }

    private static Dictionary<Guid, (string SkillName, string Group, IReadOnlyList<IReadOnlyList<string>> Levels, int? ExpectedLevel)> FreezeFrom(
        IReadOnlyList<Skill> skills, string position)
    {
        var dict = new Dictionary<Guid, (string, string, IReadOnlyList<IReadOnlyList<string>>, int?)>();
        foreach (Skill skill in skills)
        {
            IReadOnlyList<IReadOnlyList<string>> levels =
                [.. skill.Levels.OrderBy(l => l.Level.Value).Select(l => l.Criteria)];
            int? expected = skill.Expectations
                .FirstOrDefault(e => e.Position == position)?.Level.Value;
            dict[skill.Id] = (skill.Name, skill.Group.Value, levels, expected);
        }

        return dict;
    }
}
