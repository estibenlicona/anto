using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Estimation;
using GestionCapacidad.Application.Initiatives;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Estimation;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure.Catalogs;
using GestionCapacidad.Infrastructure.Persistence;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

/// <summary>
/// La versión 1 migrada tiene que decir lo mismo que el modelo de hoy sobre
/// **talla, puntaje y rango de esfuerzo**. El persona-mes *esperado* sí cambia,
/// y es a propósito: hoy sale del punto medio de la banda, así que todas las
/// iniciativas de una talla reciben la misma cifra sin importar su puntaje. Ese
/// es el defecto que el cambio corrige (design.md — D10), y los tests de abajo
/// lo fijan en las dos direcciones para que nadie lo lea como una regresión.
/// </summary>
public sealed class LegacyModelConversionTests
{
    private static readonly DateTime At = new(2026, 3, 1, 12, 0, 0, DateTimeKind.Utc);

    private static async Task<EvaluationModelDto> LegacyModelAsync()
    {
        // Los repositorios vacíos hacen que el proveedor caiga en los valores de
        // referencia, que son exactamente los que la migración convierte.
        var provider = new EvaluationModelProvider(
            EmptyRepository<QuestionPool>(),
            EmptyRepository<TallaBandSet>(),
            EmptyRepository<CapabilityMix>());

        return await provider.GetAsync();
    }

    private static ISingleDocumentRepository<T> EmptyRepository<T>()
        where T : GestionCapacidad.Domain.Primitives.AggregateRoot
    {
        var repository = new Mock<ISingleDocumentRepository<T>>();
        repository
            .Setup(r => r.GetAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync((T?)null);
        return repository.Object;
    }

    private static EstimationModelVersionDto MigratedVersion() =>
        LegacyModelConversion
            .BuildInitialModel(
                ModelParameterDefaults.QuestionPool(),
                ModelParameterDefaults.TallaBands(),
                ModelParameterDefaults.CapabilityMix(),
                new DateOnly(2026, 3, 1),
                At)
            .CurrentVersion!
            .ToDto("MOD-F1");

    /// <summary>Las mismas respuestas en los dos lenguajes: 0–4 de hoy, índice de opción en el nuevo.</summary>
    private static (EvaluationInput Legacy, EstimationInput Parametric) Answers(
        EvaluationModelDto legacy,
        int? value)
    {
        var triage = new bool[legacy.Triage.Count];

        Dictionary<string, int> legacyAnswers = value is int score
            ? legacy.Questions.ToDictionary(q => q.Id, _ => score, StringComparer.Ordinal)
            : [];

        Dictionary<string, RawAnswer> parametricAnswers = value is int index
            ? legacy.Questions.ToDictionary(
                q => q.Id,
                _ => RawAnswer.FromOption(index),
                StringComparer.Ordinal)
            : [];

        return (
            new EvaluationInput(triage, legacyAnswers, 6),
            new EstimationInput(triage, parametricAnswers, 6));
    }

    [Theory]
    [InlineData(null)]
    [InlineData(2)]
    [InlineData(4)]
    public async Task LaVersionMigradaDaLaMismaTallaYElMismoPuntajeQueElMotorDeHoy(int? value)
    {
        EvaluationModelDto legacy = await LegacyModelAsync();
        EstimationModelVersionDto migrated = MigratedVersion();
        (EvaluationInput legacyInput, EstimationInput parametricInput) = Answers(legacy, value);

        InitiativeEvaluation before = EvaluationEngine.Evaluate(legacy, legacyInput, At);
        EstimationResult after = ParametricEstimationEngine.Evaluate(migrated, parametricInput);

        Assert.Equal(before.Talla, after.Talla);
        Assert.Equal(before.Pct, after.Size.Pct);
        Assert.Equal(before.PmMin, after.PmMin);
        Assert.Equal(before.PmMax, after.PmMax);
    }

    [Theory]
    [InlineData(null)]
    [InlineData(4)]
    public async Task ElPersonaMesEsperadoDejaDeSerElPuntoMedio(int? value)
    {
        EvaluationModelDto legacy = await LegacyModelAsync();
        EstimationModelVersionDto migrated = MigratedVersion();
        (EvaluationInput legacyInput, EstimationInput parametricInput) = Answers(legacy, value);

        InitiativeEvaluation before = EvaluationEngine.Evaluate(legacy, legacyInput, At);
        EstimationResult after = ParametricEstimationEngine.Evaluate(migrated, parametricInput);

        // Hoy: el punto medio del rango, igual para toda la talla. Ahora: el
        // puntaje de esfuerzo ubica el resultado dentro del rango.
        decimal midpoint = (before.PmMin + before.PmMax) / 2m;
        Assert.Equal(midpoint, before.FteExpected * legacyInput.TargetMonths);
        Assert.NotEqual(midpoint, after.PmExpected);
        Assert.InRange(after.PmExpected, after.PmMin, after.PmMax);
    }

    [Fact]
    public async Task ConElEsfuerzoEnLaMitadDeLaEscalaElEsperadoEsElParametro()
    {
        EvaluationModelDto legacy = await LegacyModelAsync();
        EstimationModelVersionDto migrated = MigratedVersion();
        (_, EstimationInput parametricInput) = Answers(legacy, 2);

        EstimationResult after = ParametricEstimationEngine.Evaluate(migrated, parametricInput);
        TallaRuleDto rule = migrated.TallaRules.Single(r => r.Talla == after.Talla);

        Assert.Equal(50m, after.Effort.Pct);
        Assert.Equal(rule.PmExpected, after.PmExpected);
    }

    [Fact]
    public void LaVersionMigradaConservaLasSieteDimensionesYLasTreintaPreguntas()
    {
        EstimationModelVersionDto migrated = MigratedVersion();

        Assert.Equal(7, migrated.Dimensions.Count);
        Assert.Equal(30, migrated.Questions.Count);
        Assert.Equal(7, migrated.Drivers.Count);
        Assert.Equal(6, migrated.Triage.Count);
        Assert.Equal(5, migrated.TallaRules.Count);
        Assert.All(migrated.Questions, q => Assert.Equal(5, q.Options.Count));
    }

    [Fact]
    public void CadaColumnaDelMixMigradoSuma100()
    {
        EstimationModelVersionDto migrated = MigratedVersion();

        foreach (TallaRuleDto rule in migrated.TallaRules)
        {
            decimal total = migrated.Mix.Sum(m => m.ByTalla.GetValueOrDefault(rule.Talla, 0m));
            Assert.Equal(100m, total);
        }
    }

    [Fact]
    public void LaVersionMigradaNoPasaElChequeoDePesosYEsoQuedaRegistrado()
    {
        ModelVersion version = LegacyModelConversion
            .BuildInitialModel(
                ModelParameterDefaults.QuestionPool(),
                ModelParameterDefaults.TallaBands(),
                ModelParameterDefaults.CapabilityMix(),
                new DateOnly(2026, 3, 1),
                At)
            .CurrentVersion!;

        ModelValidationReport report = ModelVersionValidation.Validate(version);

        // El modelo de hoy no tiene salida de riesgo: ninguna pregunta le
        // aporta. La migración no inventa pesos para taparlo — lo deja visible,
        // que es el segundo agujero que el cambio viene a cerrar.
        ModelValidationCheck failed = Assert.Single(report.Impediments);
        Assert.Equal(ModelVersionValidation.CheckWeights, failed.Code);
        Assert.Contains("riesgo", failed.Missing);
        Assert.False(report.CanPublish);
    }

    [Fact]
    public void LaVersionMigradaNaceVigenteYSinPoderEditarse()
    {
        EstimationModel model = LegacyModelConversion.BuildInitialModel(
            ModelParameterDefaults.QuestionPool(),
            ModelParameterDefaults.TallaBands(),
            ModelParameterDefaults.CapabilityMix(),
            new DateOnly(2026, 3, 1),
            At);

        ModelVersion version = Assert.Single(model.Versions);

        Assert.Equal(ModelVersionStatus.Vigente, version.Status);
        Assert.Equal(new DateOnly(2026, 3, 1), version.EffectiveFrom);
        Assert.Equal(LegacyModelConversion.Note, version.ChangeNote);
        Assert.Throws<GestionCapacidad.Domain.Exceptions.DomainException>(() =>
            version.ReplaceMixModifiers([], LegacyModelConversion.Author, At));
    }
}
