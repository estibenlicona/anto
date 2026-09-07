using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class SkillGroupTests
{
    [Theory]
    [InlineData("human", "Humana")]
    [InlineData("technical", "Técnica")]
    public void From_WithValidSlug_ReturnsGroupWithSpanishLabel(string value, string label)
    {
        SkillGroup group = SkillGroup.From(value);

        Assert.Equal(value, group.Value);
        Assert.Equal(label, group.Label);
    }

    [Fact]
    public void ValidValues_AreTheTwoOfTheContract_InOrder()
    {
        Assert.Equal(["human", "technical"], SkillGroup.ValidValues.Select(g => g.Value));
    }

    [Theory]
    [InlineData("")]
    [InlineData("Human")]
    [InlineData("soft")]
    public void From_WithInvalidValue_ThrowsListingValidOnes(string value)
    {
        var exception = Assert.Throws<DomainException>(() => SkillGroup.From(value));

        Assert.Contains("human", exception.Message);
        Assert.Contains("technical", exception.Message);
    }
}
