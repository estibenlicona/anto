using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class ModelVersionTests
{
    private static readonly string Author = EstimationModelBuilder.Author;
    private static readonly DateTime At = EstimationModelBuilder.At;

    // ---- Inmutabilidad -----------------------------------------------------

    /// <summary>
    /// Cada mutación por separado: si alguna se olvidara del guardián, una
    /// versión publicada se podría reescribir por esa puerta y el resto de las
    /// cerraduras no serviría de nada.
    /// </summary>
    public static TheoryData<string, Action<ModelVersion>> Mutations() => new()
    {
        { "dimensiones", v => v.ReplaceDimensions([new ModelDimension("X", "X", 1, true)], Author, At) },
        { "preguntas", v => v.ReplaceQuestions([.. EstimationModelBuilder.ValidQuestions()], Author, At) },
        { "tamizaje", v => v.ReplaceTriage([new ModelTriageQuestion(0, "T9", "¿Sí?", false)], Author, At) },
        { "drivers", v => v.ReplaceDrivers([new ModelDriver("D", "D", [EstimationOutput.Size])], Author, At) },
        { "pesos", v => v.SetQuestionWeights("Q1", new Dictionary<EstimationOutput, decimal> { [EstimationOutput.Size] = 9m }, Author, At) },
        { "tallas", v => v.ReplaceTallaRules([20m, 40m, 60m, 80m], [.. EstimationModelBuilder.ValidTallaRules()], Author, At) },
        { "riesgo", v => v.ReplaceRiskBands([new ModelRiskBand(0, "Único", 100m)], Author, At) },
        { "mix", v => v.ReplaceMix([.. EstimationModelBuilder.ValidMix()], Author, At) },
        { "modificadores", v => v.ReplaceMixModifiers([], Author, At) },
    };

    [Theory]
    [MemberData(nameof(Mutations))]
    public void UnaVersionVigenteRechazaCadaMutacion(string _, Action<ModelVersion> mutate)
    {
        EstimationModel model = EstimationModelBuilder.WithValidDraft();
        model.Publish(1, new DateOnly(2026, 3, 1), "Primera versión.", Author, [], At);
        ModelVersion current = model.VersionOf(1);

        DomainException error = Assert.Throws<DomainException>(() => mutate(current));

        Assert.Contains("no se edita", error.Message);
        Assert.Contains("versión nueva", error.Message);
    }

    [Theory]
    [MemberData(nameof(Mutations))]
    public void UnaVersionArchivadaRechazaCadaMutacion(string _, Action<ModelVersion> mutate)
    {
        EstimationModel model = EstimationModelBuilder.WithPublishedAndDraft();
        EstimationModelBuilder.FillValid(model.VersionOf(2));
        model.Publish(2, new DateOnly(2026, 6, 1), "Segunda versión.", Author, [], At);

        ModelVersion archived = model.VersionOf(1);
        Assert.Equal(ModelVersionStatus.Archivada, archived.Status);

        Assert.Throws<DomainException>(() => mutate(archived));
    }

    [Fact]
    public void UnBorradorAceptaLasMutaciones()
    {
        EstimationModel model = EstimationModelBuilder.WithValidDraft();

        ModelVersion draft = model.VersionOf(1);

        Assert.Equal(ModelVersionStatus.Borrador, draft.Status);
        Assert.Equal(2, draft.Dimensions.Count);
        Assert.Equal(4, draft.Questions.Count);
        Assert.Equal(5, draft.TallaRules.Count);
    }

    // ---- Contenido ---------------------------------------------------------

    [Fact]
    public void UnaVersionNuevaCopiaTodoElContenidoDeLaDeOrigen()
    {
        EstimationModel model = EstimationModelBuilder.WithPublishedAndDraft();

        ModelVersion source = model.VersionOf(1);
        ModelVersion draft = model.VersionOf(2);

        Assert.Equal(ModelVersionStatus.Borrador, draft.Status);
        Assert.Equal(source.Dimensions.Count, draft.Dimensions.Count);
        Assert.Equal(source.Questions.Count, draft.Questions.Count);
        Assert.Equal(source.Drivers.Count, draft.Drivers.Count);
        Assert.Equal(source.TallaRules.Count, draft.TallaRules.Count);
        Assert.Equal(source.TallaBoundaries, draft.TallaBoundaries);
        Assert.Equal(source.Mix.Count, draft.Mix.Count);
        Assert.Equal(source.MixModifiers.Count, draft.MixModifiers.Count);
        // La de origen queda intacta.
        Assert.Equal(ModelVersionStatus.Vigente, source.Status);
    }

    [Fact]
    public void NoSeAbreUnSegundoBorradorSobreElMismoModelo()
    {
        EstimationModel model = EstimationModelBuilder.WithPublishedAndDraft();

        DomainException error = Assert.Throws<DomainException>(
            () => model.CreateVersionFrom(1, Author, At));

        Assert.Contains("borrador abierto", error.Message);
    }

    [Fact]
    public void LosCortesTienenQueSerUnoMenosQueLasTallas()
    {
        ModelVersion draft = EstimationModelBuilder.WithValidDraft().VersionOf(1);

        DomainException error = Assert.Throws<DomainException>(() =>
            draft.ReplaceTallaRules([20m, 40m], [.. EstimationModelBuilder.ValidTallaRules()], Author, At));

        Assert.Contains("4 cortes", error.Message);
    }

    [Fact]
    public void UnaTallaNoPuedeQuedarMasAngostaQueElMinimo()
    {
        ModelVersion draft = EstimationModelBuilder.WithValidDraft().VersionOf(1);

        DomainException error = Assert.Throws<DomainException>(() =>
            draft.ReplaceTallaRules([20m, 22m, 60m, 80m], [.. EstimationModelBuilder.ValidTallaRules()], Author, At));

        Assert.Contains("crecientes", error.Message);
    }

    [Fact]
    public void ElRangoDePorcentajeSaleDeLosCortes()
    {
        ModelVersion draft = EstimationModelBuilder.WithValidDraft().VersionOf(1);

        Assert.Equal(0m, draft.MinPctOf(draft.TallaRules[0]));
        Assert.Equal(20m, draft.MaxPctOf(draft.TallaRules[0]));
        Assert.Equal(80m, draft.MinPctOf(draft.TallaRules[4]));
        Assert.Equal(100m, draft.MaxPctOf(draft.TallaRules[4]));
    }

    [Fact]
    public void CadaCambioDejaSuEntradaDeHistorialConAutor()
    {
        ModelVersion draft = EstimationModelBuilder.WithValidDraft().VersionOf(1);

        Assert.All(draft.History, entry => Assert.Equal(Author, entry.Author));
        Assert.Contains(draft.History, e => e.Section == ModelVersion.SectionMix);
        Assert.Contains(draft.History, e => e.Section == ModelVersion.SectionTallas);
    }

    [Fact]
    public void UnCambioSinAutorNoSeRegistra()
    {
        ModelVersion draft = EstimationModelBuilder.WithValidDraft().VersionOf(1);

        Assert.Throws<DomainException>(() =>
            draft.ReplaceRiskBands([new ModelRiskBand(0, "Único", 100m)], "  ", At));
    }

    // ---- Publicación -------------------------------------------------------

    [Fact]
    public void PublicarConUnImpedimentoNoCambiaNada()
    {
        EstimationModel model = EstimationModelBuilder.WithPublishedAndDraft();
        ModelVersion draft = model.VersionOf(2);

        DomainException error = Assert.Throws<DomainException>(() =>
            model.Publish(2, new DateOnly(2026, 6, 1), "Segunda.", Author, ["MIX"], At));

        Assert.Contains("1 impedimentos", error.Message);
        Assert.Equal(ModelVersionStatus.Borrador, draft.Status);
        Assert.Equal(ModelVersionStatus.Vigente, model.VersionOf(1).Status);
        Assert.Equal(1, model.CurrentVersion!.Number);
    }

    [Fact]
    public void PublicarArchivaLaAnteriorYCierraSuVigencia()
    {
        EstimationModel model = EstimationModelBuilder.WithPublishedAndDraft();
        var effectiveFrom = new DateOnly(2026, 6, 1);

        model.Publish(2, effectiveFrom, "Se recalibró el mix.", Author, [], At);

        ModelVersion previous = model.VersionOf(1);
        ModelVersion published = model.VersionOf(2);

        Assert.Equal(ModelVersionStatus.Archivada, previous.Status);
        Assert.Equal(effectiveFrom, previous.EffectiveTo);
        Assert.Equal(ModelVersionStatus.Vigente, published.Status);
        Assert.Equal(effectiveFrom, published.EffectiveFrom);
        Assert.Equal("Se recalibró el mix.", published.ChangeNote);
        Assert.Equal(2, model.CurrentVersion!.Number);
    }

    [Fact]
    public void UnModeloTieneAloSumoUnaVersionVigente()
    {
        EstimationModel model = EstimationModelBuilder.WithPublishedAndDraft();

        model.Publish(2, new DateOnly(2026, 6, 1), "Segunda.", Author, [], At);

        Assert.Single(model.Versions.Where(v => v.Status.IsCurrent));
    }

    [Fact]
    public void PublicarSinNotaDeCambioNoSePermite()
    {
        EstimationModel model = EstimationModelBuilder.WithPublishedAndDraft();

        Assert.Throws<DomainException>(() =>
            model.Publish(2, new DateOnly(2026, 6, 1), "   ", Author, [], At));
    }

    [Fact]
    public void PublicarSinAutorNoSePermite()
    {
        EstimationModel model = EstimationModelBuilder.WithPublishedAndDraft();

        DomainException error = Assert.Throws<DomainException>(() =>
            model.Publish(2, new DateOnly(2026, 6, 1), "Segunda.", "", [], At));

        Assert.Contains("autor", error.Message);
    }

    [Fact]
    public void NoSePublicaDosVecesLaMismaVersion()
    {
        EstimationModel model = EstimationModelBuilder.WithValidDraft();
        model.Publish(1, new DateOnly(2026, 3, 1), "Primera.", Author, [], At);

        DomainException error = Assert.Throws<DomainException>(() =>
            model.Publish(1, new DateOnly(2026, 4, 1), "Otra vez.", Author, [], At));

        Assert.Contains("ya no se publica", error.Message);
    }
}
