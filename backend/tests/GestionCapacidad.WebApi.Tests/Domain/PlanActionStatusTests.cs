using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class PlanActionStatusTests
{
    [Theory]
    [InlineData("InProgress", "En curso")]
    [InlineData("Done", "Cumplida")]
    public void From_WithValidSlug_ReturnsStatusWithSpanishLabel(string value, string label)
    {
        PlanActionStatus status = PlanActionStatus.From(value);

        Assert.Equal(value, status.Value);
        Assert.Equal(label, status.Label);
    }

    [Fact]
    public void ValidValues_AreTheTwoOfTheContract_InOrder()
    {
        Assert.Equal(["InProgress", "Done"], PlanActionStatus.ValidValues.Select(s => s.Value));
    }

    [Theory]
    [InlineData("")]
    [InlineData("done")]
    [InlineData("Closed")]
    public void From_WithInvalidValue_ThrowsListingValidOnes(string value)
    {
        var exception = Assert.Throws<DomainException>(() => PlanActionStatus.From(value));

        Assert.Contains("InProgress", exception.Message);
        Assert.Contains("Done", exception.Message);
    }
}
