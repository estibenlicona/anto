using GestionCapacidad.Application.Estimation;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Catalogs;
using GestionCapacidad.WebApi.Tests.Domain;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

/// <summary>
/// La diferencia que da sentido al cambio: publicar mueve lo que se estima,
/// guardar un borrador no. Sin esto, editar parámetros seguiría cambiando el
/// resultado de la iniciativa que alguien está evaluando en ese momento.
/// </summary>
public sealed class EstimationVersionProviderTests
{
    private const string Author = "Estiben Licona";

    private static (EstimationVersionProvider Provider, EstimationModel Model) Build()
    {
        EstimationModel model = EstimationModelBuilder.WithPublishedAndDraft();
        EstimationModelBuilder.FillValid(model.VersionOf(2));

        var repository = new Mock<IEstimationModelRepository>();
        repository
            .Setup(r => r.GetByPhaseAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(model);
        repository
            .Setup(r => r.GetAllWithContentAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync([model]);

        return (new EstimationVersionProvider(repository.Object), model);
    }

    [Fact]
    public async Task ElModeloServidoEsLaVersionVigente()
    {
        (EstimationVersionProvider provider, _) = Build();

        EstimationModelVersionDto? version = await provider.GetCurrentAsync();

        Assert.NotNull(version);
        Assert.Equal(1, version.VersionNumber);
    }

    [Fact]
    public async Task GuardarUnBorradorNoCambiaElModeloServido()
    {
        (EstimationVersionProvider provider, EstimationModel model) = Build();

        model.VersionOf(2).ReplaceRiskBands(
            [
                new ModelRiskBand(0, "Bajo", 10m),
                new ModelRiskBand(1, "Alto", 100m),
            ],
            Author,
            EstimationModelBuilder.At);

        EstimationModelVersionDto? version = await provider.GetCurrentAsync();

        Assert.NotNull(version);
        Assert.Equal(1, version.VersionNumber);
        Assert.Equal(3, version.RiskBands.Count);
    }

    [Fact]
    public async Task PublicarCambiaElModeloServido()
    {
        (EstimationVersionProvider provider, EstimationModel model) = Build();

        model.VersionOf(2).ReplaceTallaRules(
            [10m, 40m, 60m, 80m],
            [.. EstimationModelBuilder.ValidTallaRules()],
            Author,
            EstimationModelBuilder.At);
        model.Publish(2, new DateOnly(2026, 6, 1), "Se movió el primer corte.", Author, [], EstimationModelBuilder.At);

        EstimationModelVersionDto? version = await provider.GetCurrentAsync();

        Assert.NotNull(version);
        Assert.Equal(2, version.VersionNumber);
        Assert.Equal(10m, version.TallaRules[0].MaxPct);
    }

    [Fact]
    public async Task UnaVersionArchivadaSeSigueLeyendoPorSuId()
    {
        (EstimationVersionProvider provider, EstimationModel model) = Build();
        Guid archivedId = model.VersionOf(1).Id;
        model.Publish(2, new DateOnly(2026, 6, 1), "Segunda.", Author, [], EstimationModelBuilder.At);

        EstimationModelVersionDto? version = await provider.GetByIdAsync(archivedId);

        // Es lo que permite leer una estimación vieja contra el modelo con el
        // que se calculó, y no contra el de hoy.
        Assert.NotNull(version);
        Assert.Equal(1, version.VersionNumber);
    }

    [Fact]
    public async Task UnaFaseSinModeloNoTieneVersionVigente()
    {
        var repository = new Mock<IEstimationModelRepository>();
        repository
            .Setup(r => r.GetByPhaseAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((EstimationModel?)null);

        EstimationModelVersionDto? version =
            await new EstimationVersionProvider(repository.Object).GetCurrentAsync(3);

        Assert.Null(version);
    }
}
