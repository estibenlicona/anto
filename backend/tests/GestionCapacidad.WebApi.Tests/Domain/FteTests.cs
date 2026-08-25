using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class FteTests
{
    [Theory]
    [InlineData(0.0)]
    [InlineData(0.5)]
    [InlineData(1.0)]
    public void From_WithValidValue_Succeeds(double value)
    {
        var fte = Fte.From((float)value);
        Assert.Equal((float)value, fte.Value);
    }

    [Theory]
    [InlineData(-0.1)]
    [InlineData(1.1)]
    [InlineData(-1.0)]
    public void From_WithOutOfRangeValue_ThrowsDomainException(double value)
    {
        Assert.Throws<DomainException>(() => Fte.From((float)value));
    }

    [Fact]
    public void TwoInstances_WithSameValue_AreEqual()
    {
        Assert.Equal(Fte.From(0.5f), Fte.From(0.5f));
    }

    [Fact]
    public void FullTime_IsOne()
    {
        Assert.Equal(1.0f, Fte.FullTime.Value);
    }

    [Fact]
    public void HalfTime_IsPointFive()
    {
        Assert.Equal(0.5f, Fte.HalfTime.Value);
    }

    [Fact]
    public void ToString_ReturnsFormattedValue()
    {
        Assert.Equal("0.5", Fte.From(0.5f).ToString());
    }
}
