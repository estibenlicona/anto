using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Skills;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class SkillCatalogMappingsTests
{
    [Fact]
    public void ToDto_FillsExpectations_OneEntryPerCurrentPosition()
    {
        var skill = new Skill("SQL", SkillGroup.Technical, "d");
        skill.SetExpectation("Data Engineer", 3);

        SkillDto dto = SkillCatalogMappings.ToDto(skill, ["Backend Dev", "Data Engineer"]);

        Assert.Equal(2, dto.Expectations.Count);
        Assert.Null(dto.Expectations.Single(e => e.Position == "Backend Dev").Level);
        Assert.Equal(3, dto.Expectations.Single(e => e.Position == "Data Engineer").Level);
    }

    [Fact]
    public void ToDto_TwoPositionsWithDifferentLevels_DoNotOverwriteEachOther()
    {
        var skill = new Skill("SQL", SkillGroup.Technical, "d");
        skill.SetExpectation("Data Engineer", 3);
        skill.SetExpectation("Backend Dev", 2);

        SkillDto dto = SkillCatalogMappings.ToDto(skill, ["Backend Dev", "Data Engineer"]);

        Assert.Equal(2, dto.Expectations.Single(e => e.Position == "Backend Dev").Level);
        Assert.Equal(3, dto.Expectations.Single(e => e.Position == "Data Engineer").Level);
    }

    [Fact]
    public void ToDto_LevelsComeInOrderOneToFour()
    {
        var skill = new Skill("SQL", SkillGroup.Technical, "d");

        SkillDto dto = SkillCatalogMappings.ToDto(skill, []);

        Assert.Equal([1, 2, 3, 4], dto.Levels.Select(l => l.Level));
    }
}
