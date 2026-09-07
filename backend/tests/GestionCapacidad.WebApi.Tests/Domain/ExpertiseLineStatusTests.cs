using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class ExpertiseLineStatusTests
{
    [Theory]
    [InlineData("Active", "Activa")]
    [InlineData("Archived", "Archivada")]
    public void From_WithValidSlug_ReturnsStatusWithSpanishLabel(string value, string label)
    {
        ExpertiseLineStatus status = ExpertiseLineStatus.From(value);

        Assert.Equal(value, status.Value);
        Assert.Equal(label, status.Label);
    }

    [Fact]
    public void ValidValues_AreTheTwoOfTheContract_InOrder()
    {
        Assert.Equal(["Active", "Archived"], ExpertiseLineStatus.ValidValues.Select(s => s.Value));
    }

    [Theory]
    [InlineData("")]
    [InlineData("active")]
    [InlineData("Inactive")]
    public void From_WithInvalidValue_ThrowsListingValidOnes(string value)
    {
        var exception = Assert.Throws<DomainException>(() => ExpertiseLineStatus.From(value));

        Assert.Contains("Active", exception.Message);
        Assert.Contains("Archived", exception.Message);
    }
}
