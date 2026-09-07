using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class AssessmentTests
{
    private static readonly Guid PersonId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid SkillId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    [Fact]
    public void Ctor_NacesInProgress_WithoutAnySkill()
    {
        var assessment = new Assessment(PersonId, "2026-S1");

        Assert.Equal(AssessmentStatus.InProgress, assessment.Status);
        Assert.Empty(assessment.Skills);
        Assert.Null(assessment.ClosedAtUtc);
    }

    [Theory]
    [InlineData("")]
    [InlineData("2026-S3")]
    [InlineData("2026")]
    [InlineData("26-S1")]
    public void Ctor_WithInvalidCycle_Throws(string cycle)
    {
        Assert.Throws<DomainException>(() => new Assessment(PersonId, cycle));
    }

    [Fact]
    public void SaveSkill_WithoutGap_WithoutNote_DoesNotThrow()
    {
        var assessment = new Assessment(PersonId, "2026-S1");

        assessment.SaveSkill(SkillId, 3, [], "", expectedLevel: 2);

        Assert.Equal(3, assessment.Skills.Single().Level);
    }

    [Fact]
    public void SaveSkill_WithGap_WithoutNote_Throws()
    {
        var assessment = new Assessment(PersonId, "2026-S1");

        Assert.Throws<DomainException>(() => assessment.SaveSkill(SkillId, 2, [], "", expectedLevel: 3));
    }

    [Fact]
    public void SaveSkill_WithGap_WithNote_DoesNotThrow()
    {
        var assessment = new Assessment(PersonId, "2026-S1");

        assessment.SaveSkill(SkillId, 2, [], "Le falta acompañamiento", expectedLevel: 3);

        Assert.Equal(2, assessment.Skills.Single().Level);
    }

    [Fact]
    public void SaveSkill_TwiceOnTheSameSkill_ReplacesNotDuplicates()
    {
        var assessment = new Assessment(PersonId, "2026-S1");
        assessment.SaveSkill(SkillId, 2, [], "", expectedLevel: null);

        assessment.SaveSkill(SkillId, 4, [], "", expectedLevel: null);

        AssessmentSkillAnswer answer = Assert.Single(assessment.Skills);
        Assert.Equal(4, answer.Level);
    }

    [Fact]
    public void SaveSkill_OnClosed_Throws()
    {
        var assessment = new Assessment(PersonId, "2026-S1");
        assessment.SaveSkill(SkillId, 3, [], "", expectedLevel: null);
        assessment.Close(FrozenFor(SkillId), 1, DateTime.UtcNow);

        Assert.Throws<DomainException>(() => assessment.SaveSkill(SkillId, 4, [], "", expectedLevel: null));
    }

    [Fact]
    public void Close_FreezesEachAnsweredSkill_AndSetsClosedAtUtc()
    {
        var assessment = new Assessment(PersonId, "2026-S1");
        assessment.SaveSkill(SkillId, 2, [], "", expectedLevel: null);
        var now = DateTime.UtcNow;

        assessment.Close(FrozenFor(SkillId, expectedLevel: 3), 4, now);

        Assert.Equal(AssessmentStatus.Closed, assessment.Status);
        Assert.Equal(now, assessment.ClosedAtUtc);
        Assert.Equal(4, assessment.CatalogVersionAtClose);
        AssessmentSkillAnswer answer = Assert.Single(assessment.Skills);
        Assert.Equal("SQL", answer.FrozenSkillName);
        Assert.Equal(3, answer.FrozenExpectedLevel);
    }

    [Fact]
    public void Close_OnAlreadyClosed_Throws()
    {
        var assessment = new Assessment(PersonId, "2026-S1");
        assessment.Close(FrozenFor(), 1, DateTime.UtcNow);

        Assert.Throws<DomainException>(() => assessment.Close(FrozenFor(), 1, DateTime.UtcNow));
    }

    private static Dictionary<Guid, (string SkillName, string Group, IReadOnlyList<IReadOnlyList<string>> Levels, int? ExpectedLevel)> FrozenFor(
        Guid? skillId = null, int? expectedLevel = null)
    {
        var dict = new Dictionary<Guid, (string, string, IReadOnlyList<IReadOnlyList<string>>, int?)>();
        if (skillId is Guid id)
        {
            dict[id] = ("SQL", "technical", [["A"], [], [], []], expectedLevel);
        }

        return dict;
    }
}
