using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class CostReadingTests
{
    [Theory]
    [InlineData("InRange", "En rango")]
    [InlineData("High", "Alto")]
    [InlineData("Low", "Bajo")]
    public void From_WithValidSlug_ReturnsReadingWithSpanishLabel(string value, string label)
    {
        CostReading reading = CostReading.From(value);

        Assert.Equal(value, reading.Value);
        Assert.Equal(label, reading.Label);
    }

    [Fact]
    public void ValidValues_AreTheThreeOfTheContract_InOrder()
    {
        Assert.Equal(["InRange", "High", "Low"], CostReading.ValidValues.Select(r => r.Value));
    }

    [Theory]
    [InlineData("")]
    [InlineData("inrange")]
    [InlineData("Medium")]
    public void From_WithInvalidValue_ThrowsListingValidOnes(string value)
    {
        var exception = Assert.Throws<DomainException>(() => CostReading.From(value));

        Assert.Contains("InRange", exception.Message);
        Assert.Contains("High", exception.Message);
        Assert.Contains("Low", exception.Message);
    }
}
