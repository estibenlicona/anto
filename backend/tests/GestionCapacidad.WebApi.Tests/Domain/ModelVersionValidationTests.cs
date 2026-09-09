using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Estimation;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

/// <summary>
/// Cada test rompe una sola cosa y comprueba que **sólo** el chequeo que le
/// toca queda en rojo. Un chequeo que se disparara de más haría que arreglar un
/// impedimento pareciera no servir de nada.
/// </summary>
public sealed class ModelVersionValidationTests
{
    private static readonly string Author = EstimationModelBuilder.Author;
    private static readonly DateTime At = EstimationModelBuilder.At;

    private static ModelVersion Draft() => EstimationModelBuilder.WithValidDraft().VersionOf(1);

    private static void AssertOnlyFailure(ModelVersion version, string code)
    {
        ModelValidationReport report = ModelVersionValidation.Validate(version);

        ModelValidationCheck failed = Assert.Single(report.Impediments);
        Assert.Equal(code, failed.Code);
        Assert.False(string.IsNullOrWhiteSpace(failed.Missing));
        Assert.False(string.IsNullOrWhiteSpace(failed.Section));
        Assert.False(report.CanPublish);
    }

    [Fact]
    public void UnaVersionCompletaPasaLosNueveChequeos()
    {
        ModelValidationReport report = ModelVersionValidation.Validate(Draft());

        Assert.Equal(9, report.Checks.Count);
        Assert.Empty(report.Impediments);
        Assert.Empty(report.Warnings);
        Assert.True(report.CanPublish);
    }

    [Fact]
    public void UnaVersionReciénCreadaFallaEnTodoLoQueLeFalta()
    {
        var model = new EstimationModel("Vacío", EstimationPhase.Inicial);
        ModelVersion empty = model.StartFirstVersion(Author, At);

        ModelValidationReport report = ModelVersionValidation.Validate(empty);

        Assert.False(report.CanPublish);
        Assert.Equal(9, report.Checks.Count);
    }

    [Fact]
    public void DimensionesSinPreguntasActivas()
    {
        ModelVersion version = Draft();
        version.ReplaceDimensions(
            [
                new ModelDimension("ALC", "Alcance", 1, true),
                new ModelDimension("RSG", "Riesgo", 2, true),
                new ModelDimension("NUE", "Dimensión nueva", 3, true),
            ],
            Author,
            At);

        AssertOnlyFailure(version, ModelVersionValidation.CheckDimensions);
        Assert.Contains(
            "Dimensión nueva",
            ModelVersionValidation.Validate(version).Impediments[0].Missing);
    }

    [Fact]
    public void PreguntaQueApuntaAUnaDimensionQueNoExiste()
    {
        ModelVersion version = Draft();
        List<ModelQuestion> questions = [.. EstimationModelBuilder.ValidQuestions()];
        questions[0] = new ModelQuestion(
            0, "Q1", "NOPE", "¿Cuántas pantallas?", EstimationQuestionType.Cuantitativa, "pantallas",
            "VOL", true, [.. questions[0].Options], questions[0].Weights);
        version.ReplaceQuestions(questions, Author, At);

        ModelValidationReport report = ModelVersionValidation.Validate(version);

        // Rompe dos cosas a la vez: la dimensión "Alcance" se queda con una sola
        // pregunta y la pregunta apunta a una dimensión inexistente.
        Assert.Contains(report.Impediments, c => c.Code == ModelVersionValidation.CheckQuestions);
    }

    [Fact]
    public void DriverSinPreguntasQueLoAlimenten()
    {
        ModelVersion version = Draft();
        version.ReplaceDrivers(
            [
                new ModelDriver("VOL", "Volumen", [EstimationOutput.Size, EstimationOutput.Effort]),
                new ModelDriver("INC", "Incertidumbre", [EstimationOutput.Risk]),
                new ModelDriver("INT", "Integración", [EstimationOutput.Size, EstimationOutput.Mix]),
                new ModelDriver("HUE", "Driver huérfano", [EstimationOutput.Size]),
            ],
            Author,
            At);

        AssertOnlyFailure(version, ModelVersionValidation.CheckDrivers);
        Assert.Contains("HUE", ModelVersionValidation.Validate(version).Impediments[0].Missing);
    }

    [Fact]
    public void UnaSalidaSinNingunaPreguntaQueLeAporte()
    {
        ModelVersion version = Draft();
        // Se le quita el peso de riesgo a las dos únicas preguntas que lo tienen.
        version.SetQuestionWeights("Q3", new Dictionary<EstimationOutput, decimal> { [EstimationOutput.Size] = 1m }, Author, At);
        version.SetQuestionWeights(
            "Q4",
            new Dictionary<EstimationOutput, decimal> { [EstimationOutput.Effort] = 2m },
            Author,
            At);

        AssertOnlyFailure(version, ModelVersionValidation.CheckWeights);
        Assert.Contains("riesgo", ModelVersionValidation.Validate(version).Impediments[0].Missing);
    }

    [Fact]
    public void UnaPreguntaSinPesoEnNingunaSalidaEsAdvertenciaYNoImpedimento()
    {
        ModelVersion version = Draft();
        version.SetQuestionWeights("Q2", new Dictionary<EstimationOutput, decimal>(), Author, At);

        ModelValidationReport report = ModelVersionValidation.Validate(version);

        Assert.Empty(report.Impediments);
        ModelValidationCheck warning = Assert.Single(report.Warnings);
        Assert.Equal(ModelVersionValidation.CheckWeights, warning.Code);
        Assert.Contains("Q2", warning.Missing);
        Assert.True(report.CanPublish);
    }

    [Fact]
    public void ElEsperadoFueraDeRangoNoLlegaASerUnaRegla()
    {
        // El chequeo de esfuerzo existe para las filas que EF materializa desde
        // la base sin pasar por el constructor —una versión guardada antes de
        // que la regla existiera—. Desde el dominio no se puede llegar a ese
        // estado, y eso es justamente lo que este test fija.
        Assert.Throws<DomainException>(() =>
            new ModelTallaRule(2, "M", 5m, 12m, 9m, "Un trimestre", "Planificar"));

        ModelValidationReport report = ModelVersionValidation.Validate(Draft());
        Assert.Equal(
            ModelCheckStatus.Passed,
            report.Checks.Single(c => c.Code == ModelVersionValidation.CheckEffort).Status);
    }

    [Fact]
    public void BandasDeRiesgoQueNoLleganACien()
    {
        ModelVersion version = Draft();
        version.ReplaceRiskBands(
            [
                new ModelRiskBand(0, "Bajo", 33m),
                new ModelRiskBand(1, "Medio", 66m),
            ],
            Author,
            At);

        AssertOnlyFailure(version, ModelVersionValidation.CheckRisk);
        Assert.Contains("100", ModelVersionValidation.Validate(version).Impediments[0].Missing);
    }

    [Theory]
    [InlineData(19, "faltan")]
    [InlineData(21, "sobran")]
    public void UnaColumnaDelMixQueNoSuma100(int qaForXs, string expected)
    {
        ModelVersion version = Draft();
        version.ReplaceMix(
            [
                new ModelMixRow(0, "backend", "Backend", EstimationModelBuilder.Column(60m, 50m, 50m, 40m, 40m)),
                new ModelMixRow(1, "frontend", "Frontend", EstimationModelBuilder.Column(20m, 30m, 25m, 30m, 30m)),
                new ModelMixRow(2, "qa", "QA", EstimationModelBuilder.Column(qaForXs, 20m, 25m, 30m, 30m)),
            ],
            Author,
            At);

        AssertOnlyFailure(version, ModelVersionValidation.CheckMix);

        string missing = ModelVersionValidation.Validate(version).Impediments[0].Missing!;
        Assert.Contains("XS", missing);
        Assert.Contains(expected, missing);
    }

    [Fact]
    public void UnModificadorQueDejaUnPerfilPorDebajoDeCero()
    {
        ModelVersion version = Draft();
        version.ReplaceMixModifiers(
            [
                new MixModifier(
                    0, "MOD-INT", "INT", MixConditionOperator.Gte, 0.75m,
                    ["XS"],
                    [new MixAdjustment(0, "qa", -30m), new MixAdjustment(1, "backend", 30m)]),
            ],
            Author,
            At);

        AssertOnlyFailure(version, ModelVersionValidation.CheckModifiers);
        Assert.Contains("por debajo de cero", ModelVersionValidation.Validate(version).Impediments[0].Missing);
    }

    [Fact]
    public void UnModificadorQueApuntaAUnDriverInexistente()
    {
        ModelVersion version = Draft();
        version.ReplaceMixModifiers(
            [
                new MixModifier(
                    0, "MOD-X", "NOPE", MixConditionOperator.Gte, 0.75m,
                    ["M"],
                    [new MixAdjustment(0, "backend", -10m), new MixAdjustment(1, "qa", 10m)]),
            ],
            Author,
            At);

        AssertOnlyFailure(version, ModelVersionValidation.CheckModifiers);
    }

    [Fact]
    public void CadaImpedimentoDiceEnQueSeccionSeArregla()
    {
        var model = new EstimationModel("Vacío", EstimationPhase.Inicial);
        ModelValidationReport report =
            ModelVersionValidation.Validate(model.StartFirstVersion(Author, At));

        string[] sections =
        [
            ModelVersion.SectionDimensions,
            ModelVersion.SectionDrivers,
            ModelVersion.SectionTallas,
            ModelVersion.SectionMix,
        ];

        Assert.All(report.Checks, check => Assert.Contains(check.Section, sections));
    }
}
