using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class SkillLevelCriteriaTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(5)]
    public void Ctor_WithLevelOutOfRange_Throws(int level)
    {
        Assert.Throws<DomainException>(() => new SkillLevelCriteria(level, []));
    }

    [Fact]
    public void Ctor_WithEmptyCriterion_Throws()
    {
        Assert.Throws<DomainException>(() => new SkillLevelCriteria(1, ["Sabe X", "  "]));
    }

    [Fact]
    public void Ctor_TrimsEachCriterion()
    {
        var criteria = new SkillLevelCriteria(2, ["  Sabe X  "]);

        Assert.Equal("Sabe X", criteria.Criteria[0]);
    }

    [Fact]
    public void Replace_SwapsTheWholeList()
    {
        var criteria = new SkillLevelCriteria(3, ["A", "B"]);

        criteria.Replace(["C"]);

        Assert.Equal(["C"], criteria.Criteria);
    }
}

public sealed class SkillExpectationTests
{
    [Fact]
    public void Ctor_WithEmptyPosition_Throws()
    {
        Assert.Throws<DomainException>(() => new SkillExpectation("", 2));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(5)]
    public void Ctor_WithLevelOutOfRange_Throws(int level)
    {
        Assert.Throws<DomainException>(() => new SkillExpectation("Data Engineer", level));
    }

    [Fact]
    public void Ctor_TrimsThePosition()
    {
        var expectation = new SkillExpectation("  Data Engineer  ", 3);

        Assert.Equal("Data Engineer", expectation.Position);
    }
}
