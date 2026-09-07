using GestionCapacidad.Application.Assessments;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class AssessmentSkillScopeTests
{
    [Fact]
    public void Resolve_ExcludesAnInactiveSkillNeverUsed()
    {
        var active = new Skill("SQL", SkillGroup.Technical, "d");
        var inactive = new Skill("Legacy", SkillGroup.Technical, "d");
        inactive.SetActive(false);
        var assessment = new Assessment(Guid.NewGuid(), "2026-S1");

        IReadOnlyList<Skill> scope = AssessmentSkillScope.Resolve(assessment, [active, inactive]);

        Assert.Single(scope);
        Assert.Equal("SQL", scope[0].Name);
    }

    [Fact]
    public void Resolve_KeepsAnInactiveSkillAlreadyUsedByThisAssessment()
    {
        var inactive = new Skill("Legacy", SkillGroup.Technical, "d");
        inactive.SetActive(false);
        var assessment = new Assessment(Guid.NewGuid(), "2026-S1");
        assessment.SaveSkill(inactive.Id, 2, [], "", expectedLevel: null);

        IReadOnlyList<Skill> scope = AssessmentSkillScope.Resolve(assessment, [inactive]);

        Assert.Single(scope);
    }
}
