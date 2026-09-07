using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class TallaBandSetTests
{
    private static readonly decimal[] ValidBoundaries = [20m, 40m, 60m, 80m];

    private static List<TallaBand> ValidBands() =>
    [
        new(0, "XS", 0.5m, 1m, "Cambio menor"),
        new(1, "S", 1m, 3m, "Ajuste puntual"),
        new(2, "M", 3m, 6m, "Iniciativa media"),
        new(3, "L", 6m, 10m, "Iniciativa grande"),
        new(4, "XL", 10m, 18m, "Transformación mayor"),
    ];

    [Fact]
    public void Create_WithValidData_KeepsBoundariesAndBandOrder()
    {
        var set = new TallaBandSet(ValidBoundaries, ValidBands());

        Assert.Equal([20m, 40m, 60m, 80m], set.Boundaries);
        Assert.Equal(["XS", "S", "M", "L", "XL"], set.Bands.Select(b => b.Talla));
    }

    [Fact]
    public void Create_OrdersBandsByPosition_NotByArrivalOrder()
    {
        List<TallaBand> shuffled = [.. ValidBands().OrderByDescending(b => b.Position)];

        var set = new TallaBandSet(ValidBoundaries, shuffled);

        Assert.Equal(["XS", "S", "M", "L", "XL"], set.Bands.Select(b => b.Talla));
    }

    [Fact]
    public void Create_WithBandExactlyAtMinimumWidth_Accepts()
    {
        // S queda con 5 puntos justos: el mínimo es inclusivo, como en el mock.
        var set = new TallaBandSet([20m, 25m, 60m, 80m], ValidBands());

        Assert.Equal([20m, 25m, 60m, 80m], set.Boundaries);
    }

    [Theory]
    [InlineData(20, 24, 60, 80)]   // S de 4 puntos: por debajo del mínimo
    [InlineData(40, 20, 60, 80)]   // desordenados
    [InlineData(3, 40, 60, 80)]    // XS de 3 puntos contra 0
    [InlineData(20, 40, 60, 98)]   // XL de 2 puntos contra 100
    [InlineData(20, 20, 60, 80)]   // pegados
    public void Create_WithInvalidBoundaries_Throws(decimal a, decimal b, decimal c, decimal d)
    {
        var exception = Assert.Throws<DomainException>(() =>
            new TallaBandSet([a, b, c, d], ValidBands()));

        Assert.Contains("crecientes", exception.Message);
    }

    [Fact]
    public void Create_WithWrongBoundaryCount_Throws()
    {
        Assert.Throws<DomainException>(() => new TallaBandSet([20m, 40m, 60m], ValidBands()));
    }

    [Fact]
    public void Create_WithFourBands_Throws()
    {
        List<TallaBand> four = [.. ValidBands().Take(4)];

        var exception = Assert.Throws<DomainException>(() => new TallaBandSet(ValidBoundaries, four));

        Assert.Contains("5 bandas", exception.Message);
    }

    [Fact]
    public void Create_WithRepeatedTalla_Throws()
    {
        List<TallaBand> bands = ValidBands();
        bands[4] = new TallaBand(4, "xs", 10m, 18m, "Transformación mayor");

        var exception = Assert.Throws<DomainException>(() => new TallaBandSet(ValidBoundaries, bands));

        Assert.Contains("se repite", exception.Message);
    }

    [Fact]
    public void Band_WithPmMinAbovePmMax_Throws()
    {
        var exception = Assert.Throws<DomainException>(() =>
            new TallaBand(2, "M", pmMin: 6m, pmMax: 3m, "Iniciativa media"));

        Assert.Contains("M", exception.Message);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Band_WithEmptyTalla_Throws(string talla)
    {
        Assert.Throws<DomainException>(() => new TallaBand(0, talla, 0.5m, 1m, "Cambio menor"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Band_WithEmptyLectura_Throws(string lectura)
    {
        Assert.Throws<DomainException>(() => new TallaBand(0, "XS", 0.5m, 1m, lectura));
    }

    [Fact]
    public void Band_WithNegativePmMin_Throws()
    {
        Assert.Throws<DomainException>(() => new TallaBand(0, "XS", -1m, 1m, "Cambio menor"));
    }

    [Fact]
    public void Replace_WithValidData_MarksUpdated()
    {
        var set = new TallaBandSet(ValidBoundaries, ValidBands());

        set.Replace([15m, 35m, 55m, 75m], ValidBands());

        Assert.Equal([15m, 35m, 55m, 75m], set.Boundaries);
        Assert.NotNull(set.UpdatedAtUtc);
    }
}
