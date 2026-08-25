using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class CriticalityTests
{
    // ── Valid values ──────────────────────────────────────────────────────────

    [Theory]
    [InlineData("Critical")]
    [InlineData("High")]
    [InlineData("Medium")]
    [InlineData("Low")]
    public void From_WithValidValue_Succeeds(string value)
    {
        var criticality = Criticality.From(value);

        Assert.Equal(value, criticality.Value);
    }

    [Fact]
    public void From_IsCaseInsensitive()
    {
        var criticality = Criticality.From("critical");

        Assert.Equal(Criticality.Critical, criticality);
    }

    // ── Invalid values ────────────────────────────────────────────────────────

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("SuperCritical")]
    [InlineData("unknown")]
    public void From_WithInvalidValue_ThrowsDomainException(string value)
    {
        Assert.Throws<DomainException>(() => Criticality.From(value));
    }

    // ── Equality ──────────────────────────────────────────────────────────────

    [Fact]
    public void TwoInstances_WithSameValue_AreEqual()
    {
        var a = Criticality.From("High");
        var b = Criticality.From("High");

        Assert.Equal(a, b);
    }

    [Fact]
    public void TwoInstances_WithDifferentValues_AreNotEqual()
    {
        Assert.NotEqual(Criticality.Critical, Criticality.Low);
    }

    // ── Static instances ──────────────────────────────────────────────────────

    [Fact]
    public void StaticInstances_HaveCorrectValues()
    {
        Assert.Equal("Critical", Criticality.Critical.Value);
        Assert.Equal("High",     Criticality.High.Value);
        Assert.Equal("Medium",   Criticality.Medium.Value);
        Assert.Equal("Low",      Criticality.Low.Value);
    }

    [Fact]
    public void ToString_ReturnsValue()
    {
        Assert.Equal("Critical", Criticality.Critical.ToString());
    }
}
