using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Estimation;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class EstimationModelDevelopmentSeederTests
{
    private static readonly DateTime At = new(2026, 3, 1, 12, 0, 0, DateTimeKind.Utc);

    private static EstimationModel Migrated() => LegacyModelConversion.BuildInitialModel(
        ModelParameterDefaults.QuestionPool(),
        ModelParameterDefaults.TallaBands(),
        ModelParameterDefaults.CapabilityMix(),
        new DateOnly(2026, 3, 1),
        At);

    [Fact]
    public void ElModeloSembradoMuestraLosTresEstados()
    {
        EstimationModel model = Migrated();

        EstimationModelDevelopmentSeeder.BringToThreeStates(model, At);

        Assert.Equal(3, model.Versions.Count);
        Assert.Equal(ModelVersionStatus.Archivada, model.VersionOf(1).Status);
        Assert.Equal(ModelVersionStatus.Vigente, model.VersionOf(2).Status);
        Assert.Equal(ModelVersionStatus.Borrador, model.VersionOf(3).Status);
    }

    [Fact]
    public void LaVersionSembradaArreglaElImpedimentoDeLaMigrada()
    {
        EstimationModel model = Migrated();
        Assert.False(ModelVersionValidation.Validate(model.VersionOf(1)).CanPublish);

        EstimationModelDevelopmentSeeder.BringToThreeStates(model, At);

        Assert.True(ModelVersionValidation.Validate(model.VersionOf(2)).CanPublish);
    }

    [Fact]
    public void LaVersionSembradaTieneLasTresSalidasVivas()
    {
        EstimationModel model = Migrated();

        EstimationModelDevelopmentSeeder.BringToThreeStates(model, At);
        IReadOnlyList<ModelQuestion> active = model.VersionOf(2).ActiveQuestions();

        Assert.Contains(active, q => q.Weights.ContainsKey(EstimationOutput.Size));
        Assert.Contains(active, q => q.Weights.ContainsKey(EstimationOutput.Effort));
        Assert.Contains(active, q => q.Weights.ContainsKey(EstimationOutput.Risk));
    }

    [Fact]
    public void LaVersionArchivadaConservaSuContenido()
    {
        EstimationModel model = Migrated();
        int questions = model.VersionOf(1).Questions.Count;

        EstimationModelDevelopmentSeeder.BringToThreeStates(model, At);

        // Archivar no vacía: las estimaciones que calculó se siguen leyendo
        // contra ella.
        Assert.Equal(questions, model.VersionOf(1).Questions.Count);
        Assert.Equal(new DateOnly(2026, 3, 1), model.VersionOf(1).EffectiveTo);
    }
}
