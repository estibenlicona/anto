using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class CapabilityMixTests
{
    private static CapabilityMixRow Row(int position, string key, string capacidad, int xs = 0, int m = 0) =>
        new(position, key, capacidad, new Dictionary<string, int> { ["XS"] = xs, ["M"] = m });

    [Fact]
    public void Create_WithValidRows_KeepsOrder()
    {
        var mix = new CapabilityMix(
        [
            Row(0, "backend-dev", "Backend Dev", xs: 1, m: 3),
            Row(1, "qa-engineer", "QA Engineer", xs: 0, m: 1),
        ]);

        Assert.Equal(["Backend Dev", "QA Engineer"], mix.Rows.Select(r => r.Capacidad));
        Assert.Equal(3, mix.Rows.First().PorTalla["M"]);
    }

    [Fact]
    public void Create_OrdersRowsByPosition_NotByArrivalOrder()
    {
        var mix = new CapabilityMix(
        [
            Row(1, "qa-engineer", "QA Engineer"),
            Row(0, "backend-dev", "Backend Dev"),
        ]);

        Assert.Equal(["Backend Dev", "QA Engineer"], mix.Rows.Select(r => r.Capacidad));
    }

    [Fact]
    public void Create_WithEmptyList_IsValid()
    {
        Assert.Empty(new CapabilityMix([]).Rows);
    }

    [Fact]
    public void Create_WithRepeatedKey_Throws()
    {
        var exception = Assert.Throws<DomainException>(() => new CapabilityMix(
        [
            Row(0, "backend-dev", "Backend Dev"),
            Row(1, "backend-dev", "Otra cosa"),
        ]));

        Assert.Contains("backend-dev", exception.Message);
    }

    [Fact]
    public void Create_WithSameNameInDifferentCasing_Throws()
    {
        var exception = Assert.Throws<DomainException>(() => new CapabilityMix(
        [
            Row(0, "qa-1", "QA Engineer"),
            Row(1, "qa-2", " qa engineer "),
        ]));

        Assert.Contains("se repite", exception.Message);
    }

    [Fact]
    public void Row_WithNegativeAmount_Throws()
    {
        var exception = Assert.Throws<DomainException>(() =>
            new CapabilityMixRow(0, "qa", "QA Engineer", new Dictionary<string, int> { ["M"] = -1 }));

        Assert.Contains("QA Engineer", exception.Message);
        Assert.Contains("M", exception.Message);
    }

    [Theory]
    [InlineData("", "QA Engineer")]
    [InlineData("   ", "QA Engineer")]
    [InlineData("qa", "")]
    [InlineData("qa", "   ")]
    public void Row_WithEmptyKeyOrName_Throws(string key, string capacidad)
    {
        Assert.Throws<DomainException>(() =>
            new CapabilityMixRow(0, key, capacidad, new Dictionary<string, int>()));
    }

    [Fact]
    public void Row_TrimsKeyAndName()
    {
        var row = new CapabilityMixRow(0, "  qa  ", "  QA Engineer  ", new Dictionary<string, int>());

        Assert.Equal("qa", row.Key);
        Assert.Equal("QA Engineer", row.Capacidad);
    }

    [Fact]
    public void Replace_WithValidRows_MarksUpdated()
    {
        var mix = new CapabilityMix([Row(0, "backend-dev", "Backend Dev")]);

        mix.Replace([Row(0, "arquitecto", "Arquitecto", m: 1)]);

        Assert.Equal(["Arquitecto"], mix.Rows.Select(r => r.Capacidad));
        Assert.NotNull(mix.UpdatedAtUtc);
    }
}
