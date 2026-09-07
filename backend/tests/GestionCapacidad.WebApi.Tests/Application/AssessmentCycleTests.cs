using GestionCapacidad.Application.Assessments;
using Microsoft.Extensions.Time.Testing;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class AssessmentCycleTests
{
    [Theory]
    [InlineData("2026-01-15", "2026-S1")]
    [InlineData("2026-06-30", "2026-S1")]
    [InlineData("2026-07-01", "2026-S2")]
    [InlineData("2026-12-31", "2026-S2")]
    public void Current_ResolvesTheRightHalf(string date, string expectedCycle)
    {
        var timeProvider = new FakeTimeProvider(DateTimeOffset.Parse(date + "T00:00:00Z"));

        Assert.Equal(expectedCycle, AssessmentCycle.Current(timeProvider));
    }

    [Theory]
    [InlineData("2026-S1", true)]
    [InlineData("2026-S2", true)]
    [InlineData("2026-S3", false)]
    [InlineData("26-S1", false)]
    [InlineData("", false)]
    public void IsValidFormat_ValidatesTheShape(string cycle, bool expected)
    {
        Assert.Equal(expected, AssessmentCycle.IsValidFormat(cycle));
    }
}
