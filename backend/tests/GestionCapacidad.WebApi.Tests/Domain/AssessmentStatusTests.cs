using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class AssessmentStatusTests
{
    [Theory]
    [InlineData("InProgress", "En curso")]
    [InlineData("Closed", "Cerrada")]
    public void From_WithValidSlug_ReturnsStatusWithSpanishLabel(string value, string label)
    {
        AssessmentStatus status = AssessmentStatus.From(value);

        Assert.Equal(value, status.Value);
        Assert.Equal(label, status.Label);
    }

    [Fact]
    public void ValidValues_AreTheTwoOfTheContract_InOrder()
    {
        Assert.Equal(["InProgress", "Closed"], AssessmentStatus.ValidValues.Select(s => s.Value));
    }

    [Theory]
    [InlineData("")]
    [InlineData("inprogress")]
    [InlineData("Open")]
    public void From_WithInvalidValue_ThrowsListingValidOnes(string value)
    {
        var exception = Assert.Throws<DomainException>(() => AssessmentStatus.From(value));

        Assert.Contains("InProgress", exception.Message);
        Assert.Contains("Closed", exception.Message);
    }
}
