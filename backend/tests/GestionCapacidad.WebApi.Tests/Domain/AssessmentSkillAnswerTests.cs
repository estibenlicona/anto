using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class AssessmentSkillAnswerTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(5)]
    public void SetAnswer_WithLevelOutOfRange_Throws(int level)
    {
        var answer = new AssessmentSkillAnswer(Guid.NewGuid());

        Assert.Throws<DomainException>(() => answer.SetAnswer(level, [], "nota"));
    }

    [Fact]
    public void BeforeFreeze_FrozenFieldsAreNull()
    {
        var answer = new AssessmentSkillAnswer(Guid.NewGuid());
        answer.SetAnswer(2, [["A"], [], [], []], "nota");

        Assert.Null(answer.FrozenSkillName);
        Assert.Null(answer.FrozenLevels);
        Assert.Null(answer.FrozenExpectedLevel);
    }

    [Fact]
    public void Freeze_FixesTheFourFieldsGiven()
    {
        var answer = new AssessmentSkillAnswer(Guid.NewGuid());
        answer.SetAnswer(2, [], "nota");

        answer.Freeze("SQL", "technical", [["A"], ["B"], [], []], expectedLevel: 3);

        Assert.Equal("SQL", answer.FrozenSkillName);
        Assert.Equal("technical", answer.FrozenGroup);
        Assert.Equal(["A"], answer.FrozenLevels![0]);
        Assert.Equal(3, answer.FrozenExpectedLevel);
    }

    [Fact]
    public void Ctor_StartsWithFourEmptyMetLists()
    {
        var answer = new AssessmentSkillAnswer(Guid.NewGuid());

        Assert.Equal(4, answer.Met.Count);
        Assert.All(answer.Met, list => Assert.Empty(list));
    }
}
