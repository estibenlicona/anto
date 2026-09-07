using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class SkillTests
{
    [Fact]
    public void Ctor_NacesActive_WithFourEmptyLevels()
    {
        var skill = new Skill("Conocimiento del negocio", SkillGroup.Technical, "Descripción");

        Assert.True(skill.Active);
        Assert.Equal(4, skill.Levels.Count);
        Assert.Equal([1, 2, 3, 4], skill.Levels.Select(l => l.Level.Value));
        Assert.All(skill.Levels, l => Assert.Empty(l.Criteria));
        Assert.Empty(skill.Expectations);
    }

    [Fact]
    public void Ctor_WithEmptyName_Throws()
    {
        Assert.Throws<DomainException>(() => new Skill("", SkillGroup.Human, "d"));
    }

    [Fact]
    public void ReplaceCriteria_TwiceOnTheSameLevel_KeepsOnlyTheLast()
    {
        var skill = new Skill("Comunicación", SkillGroup.Human, "d");

        skill.ReplaceCriteria(3, ["A", "B"]);
        skill.ReplaceCriteria(3, ["C"]);

        Assert.Equal(["C"], skill.Levels.Single(l => l.Level.Value == 3).Criteria);
        Assert.Empty(skill.Levels.Single(l => l.Level.Value == 1).Criteria);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(5)]
    public void ReplaceCriteria_WithLevelOutOfRange_Throws(int level)
    {
        var skill = new Skill("Comunicación", SkillGroup.Human, "d");

        Assert.Throws<DomainException>(() => skill.ReplaceCriteria(level, ["A"]));
    }

    [Fact]
    public void SetExpectation_TwiceOnTheSamePosition_ReplacesNotDuplicates()
    {
        var skill = new Skill("SQL", SkillGroup.Technical, "d");

        skill.SetExpectation("Data Engineer", 3);
        skill.SetExpectation("Data Engineer", 4);

        SkillExpectation expectation = Assert.Single(skill.Expectations);
        Assert.Equal(4, expectation.Level.Value);
    }

    [Fact]
    public void SetExpectation_WithNullLevel_RemovesTheExistingEntry()
    {
        var skill = new Skill("SQL", SkillGroup.Technical, "d");
        skill.SetExpectation("Data Engineer", 3);

        skill.SetExpectation("Data Engineer", null);

        Assert.Empty(skill.Expectations);
    }
}
