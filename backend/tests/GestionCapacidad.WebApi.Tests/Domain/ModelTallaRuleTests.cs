using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class ModelTallaRuleTests
{
    private static ModelTallaRule Build(decimal pmMin, decimal pmExpected, decimal pmMax) =>
        new(0, "M", pmMin, pmExpected, pmMax, "Un trimestre completo", "Planificar");

    [Fact]
    public void ElEsperadoPuedeQuedarseEnElMinimo()
    {
        ModelTallaRule rule = Build(5m, 5m, 9m);

        Assert.Equal(5m, rule.PmExpected);
    }

    [Fact]
    public void ElEsperadoPuedeLlegarAlMaximo()
    {
        ModelTallaRule rule = Build(5m, 9m, 9m);

        Assert.Equal(9m, rule.PmExpected);
    }

    [Fact]
    public void ElEsperadoPorDebajoDelMinimoSeRechaza()
    {
        DomainException error = Assert.Throws<DomainException>(() => Build(5m, 4.9m, 9m));

        Assert.Contains("por debajo de su mínimo", error.Message);
        Assert.Contains("M", error.Message);
    }

    [Fact]
    public void ElEsperadoPorEncimaDelMaximoSeRechaza()
    {
        DomainException error = Assert.Throws<DomainException>(() => Build(5m, 9.1m, 9m));

        Assert.Contains("no puede superar su máximo", error.Message);
        Assert.Contains("M", error.Message);
    }

    [Fact]
    public void ElEsperadoNoEsElPuntoMedio()
    {
        // El punto de todo el cambio: 6 no es (5 + 9) / 2. Si alguien volviera a
        // derivarlo del rango, este valor dejaría de poder existir.
        ModelTallaRule rule = Build(5m, 6m, 9m);

        Assert.NotEqual((rule.PmMin + rule.PmMax) / 2m, rule.PmExpected);
    }

    [Fact]
    public void ElMinimoNegativoSeRechaza()
    {
        Assert.Throws<DomainException>(() => Build(-1m, 0m, 9m));
    }

    [Fact]
    public void LaAccionRecomendadaEsObligatoria()
    {
        DomainException error = Assert.Throws<DomainException>(() =>
            new ModelTallaRule(0, "M", 5m, 6m, 9m, "Un trimestre", "  "));

        Assert.Contains("acción recomendada", error.Message);
    }
}
