using GestionCapacidad.Application.PersonDetail;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class CostReadingCalculatorTests
{
    [Theory]
    [InlineData(1, 5_000_000, "InRange")]
    [InlineData(1, 6_500_000, "InRange")]
    [InlineData(1, 6_500_001, "High")]
    [InlineData(1, 3_999_999, "Low")]
    [InlineData(2, 5_500_000, "InRange")]
    [InlineData(2, 5_499_999, "Low")]
    [InlineData(2, 8_500_001, "High")]
    [InlineData(3, 11_000_000, "InRange")]
    [InlineData(3, 11_000_001, "High")]
    [InlineData(4, 9_000_000, "InRange")]
    [InlineData(4, 15_000_001, "High")]
    public void Compute_ReadsAgainstTheLevelBand(int level, decimal monthlyCost, string expected)
    {
        CostReading reading = CostReadingCalculator.Compute(level, monthlyCost);

        Assert.Equal(expected, reading.Value);
    }

    [Fact]
    public void Compute_WithLevelOutsideOneToFour_RespondsInRange_WithoutThrowing()
    {
        CostReading reading = CostReadingCalculator.Compute(0, 1_000_000m);

        Assert.Equal(CostReading.InRange, reading);
    }
}
