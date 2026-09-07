using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Initiatives;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure.Catalogs;
using Moq;

namespace GestionCapacidad.WebApi.Tests.Application;

/// <summary>
/// Los números que fija esta clase son los que hoy produce el motor del
/// frontend sobre las mismas entradas. Son dos implementaciones del mismo
/// cálculo —la pantalla evalúa en vivo mientras se responde y el servidor al
/// guardar—, así que si divergen el usuario vería una talla al responder y
/// otra al guardar. Estos tests son la red que lo impide.
/// </summary>
public sealed class EvaluationEngineTests
{
    private static readonly DateTime SavedAt = new(2026, 5, 4, 0, 0, 0, DateTimeKind.Utc);

    /// <summary>
    /// El modelo de referencia, compuesto por el proveedor real desde los
    /// parámetros por defecto: así el test cubre también la composición
    /// (rangos derivados de los cortes, orden de las dimensiones).
    /// </summary>
    private static async Task<EvaluationModelDto> ReferenceModelAsync()
    {
        var pools = new Mock<ISingleDocumentRepository<QuestionPool>>();
        var bands = new Mock<ISingleDocumentRepository<TallaBandSet>>();
        var mixes = new Mock<ISingleDocumentRepository<CapabilityMix>>();
        pools.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((QuestionPool?)null);
        bands.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((TallaBandSet?)null);
        mixes.Setup(r => r.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((CapabilityMix?)null);

        return await new EvaluationModelProvider(pools.Object, bands.Object, mixes.Object).GetAsync();
    }

    // Los tres perfiles del mock, en el orden del pool.
    private static readonly int[] Small =
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 2, 0, 1, 1, 1, 1];

    private static readonly int[] Medium =
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 1, 2, 2, 1, 2, 2, 2, 1, 2, 2, 1, 1];

    private static readonly int[] Large =
        [3, 3, 2, 2, 3, 2, 2, 3, 3, 3, 2, 2, 4, 3, 2, 3, 2, 3, 2, 3, 2, 2, 2, 2, 4, 2, 2, 3, 2, 2];

    private static Dictionary<string, int> AnswersFrom(EvaluationModelDto model, int[] values)
    {
        var answers = new Dictionary<string, int>(StringComparer.Ordinal);
        for (int i = 0; i < model.Questions.Count && i < values.Length; i++)
        {
            answers[model.Questions[i].Id] = values[i];
        }

        return answers;
    }

    // ── El modelo compuesto ───────────────────────────────────────────────────

    [Fact]
    public async Task ReferenceModel_HasTheThirtyQuestionsAndSevenDimensions()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        Assert.Equal(30, model.Questions.Count);
        Assert.Equal(
            [
                "Negocio y cliente", "Alcance funcional", "Integraciones",
                "Datos, seguridad y cumplimiento", "Tecnología y arquitectura",
                "Operación y soporte", "Incertidumbre y dependencias",
            ],
            model.Dimensions);
        Assert.Equal(6, model.Triage.Count);
        Assert.Equal(5, model.Bands.Count);
        Assert.Equal(3, model.Mix.Count);
    }

    [Fact]
    public async Task ReferenceModel_DerivesBandRangesFromTheBoundaries()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        // La frontera pertenece a la banda de abajo: con el corte en 20, XS
        // llega hasta 20 y S arranca en 21.
        Assert.Equal(
            [(0m, 20m), (21m, 40m), (41m, 60m), (61m, 80m), (81m, 100m)],
            model.Bands.Select(b => (b.MinPct, b.MaxPct)));
    }

    [Fact]
    public async Task ReferenceModel_MarksTheObjectiveQuestionsWithTheirOwnScale()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        EvaluationQuestionDto counting = model.Questions.Single(q => q.Id == "I1");
        Assert.Equal("Objective", counting.Kind);
        Assert.Equal(["Ninguno", "1–2", "3–5", "6–10", "Más de 10"], counting.Scale);

        EvaluationQuestionDto qualitative = model.Questions.Single(q => q.Id == "N1");
        Assert.Equal("Evaluative", qualitative.Kind);
        Assert.Equal(["Sin impacto", "Bajo", "Medio", "Alto", "Crítico"], qualitative.Scale);
    }

    [Fact]
    public async Task ReferenceModel_MarksTheTwoCriticalTriageQuestions()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        Assert.Equal(["T2", "T3"], model.Triage.Where(t => t.Critical).Select(t => t.Id));
    }

    [Fact]
    public async Task ReferenceModel_CarriesTheActionPerTalla()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        Assert.Equal("Resolver con capacidad existente o célula ligera.",
            model.Bands.Single(b => b.Talla == "XS").Action);
        Assert.Equal("Evaluar dividir en frentes o células y hacer discovery formal.",
            model.Bands.Single(b => b.Talla == "XL").Action);
    }

    // ── Los tres perfiles ─────────────────────────────────────────────────────

    [Fact]
    public async Task Small_OverFourMonths_ScoresTwentyTwoPercentAndTallaS()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        InitiativeEvaluation result = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput([false, false, false, false, false, false], AnswersFrom(model, Small), 4),
            SavedAt);

        Assert.Equal(62m, result.Points);
        Assert.Equal(280m, result.MaxPoints);
        Assert.Equal(22.1m, result.Pct);
        Assert.Equal("S", result.Talla);
        Assert.Equal(1m, result.PmMin);
        Assert.Equal(3m, result.PmMax);
        Assert.Equal(0.5m, result.FteExpected);
        Assert.Equal(0.25m, result.FteMin);
        Assert.Equal(0.75m, result.FteMax);
        Assert.Equal(TriageVerdict.FastTrack, result.TriageVerdict);
    }

    [Fact]
    public async Task Medium_OverSixMonths_ScoresFortyFivePercentAndTallaM()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        InitiativeEvaluation result = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput([true, false, false, true, false, false], AnswersFrom(model, Medium), 6),
            SavedAt);

        Assert.Equal(126m, result.Points);
        Assert.Equal(45m, result.Pct);
        Assert.Equal("M", result.Talla);
        Assert.Equal(0.75m, result.FteExpected);
        Assert.Equal(0.5m, result.FteMin);
        Assert.Equal(1m, result.FteMax);
        // Dos síes, ninguno crítico.
        Assert.Equal(TriageVerdict.Recommended, result.TriageVerdict);
    }

    [Fact]
    public async Task Large_OverNineMonths_ScoresSixtyFivePointFourAndTallaL()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        InitiativeEvaluation result = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput([true, true, true, true, true, false], AnswersFrom(model, Large), 9),
            SavedAt);

        Assert.Equal(183m, result.Points);
        Assert.Equal(65.4m, result.Pct);
        Assert.Equal("L", result.Talla);
        Assert.Equal(6m, result.PmMin);
        Assert.Equal(10m, result.PmMax);
        Assert.Equal(TriageVerdict.Required, result.TriageVerdict);

        // (6 + 10) / 2 / 9
        Assert.Equal(0.8889m, Math.Round(result.FteExpected, 4));
        Assert.Equal(0.6667m, Math.Round(result.FteMin, 4));
        Assert.Equal(1.1111m, Math.Round(result.FteMax, 4));
    }

    // ── Composición y dimensiones ─────────────────────────────────────────────

    [Fact]
    public async Task Mix_ForTallaM_SplitsTheExpectedFteAcrossTheThreeCapabilities()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        InitiativeEvaluation result = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput([false, false, false, false, false, false], AnswersFrom(model, Medium), 6),
            SavedAt);

        Assert.Equal(["Backend Dev", "QA Engineer", "Arquitecto"], result.Mix.Select(m => m.Capability));
        Assert.Equal([3m, 1m, 1m], result.Mix.Select(m => m.People));
        Assert.Equal([60m, 20m, 20m], result.Mix.Select(m => m.CompositionPct));

        // El FTE de cada capacidad no se redondea: las tres porciones tienen
        // que sumar el esperado.
        Assert.Equal(result.FteExpected, result.Mix.Sum(m => m.Fte));
        Assert.Equal(0.45m, Math.Round(result.Mix[0].Fte, 4));
    }

    [Fact]
    public async Task Mix_ForTallaXS_LeavesOutTheCapabilitiesWithNobody()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        InitiativeEvaluation result = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput([false, false, false, false, false, false], new Dictionary<string, int>(), 6),
            SavedAt);

        Assert.Equal("XS", result.Talla);
        MixResultAssert(result);

        static void MixResultAssert(InitiativeEvaluation result)
        {
            EvaluationMixResult only = Assert.Single(result.Mix);
            Assert.Equal("Backend Dev", only.Capability);
            Assert.Equal(100m, only.CompositionPct);
        }
    }

    [Fact]
    public async Task Dimensions_BreakDownThePointsAndTheirWeight()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        InitiativeEvaluation result = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput([false, false, false, false, false, false], AnswersFrom(model, Medium), 6),
            SavedAt);

        Assert.Equal(7, result.Dimensions.Count);

        EvaluationDimensionResult business = result.Dimensions[0];
        Assert.Equal("Negocio y cliente", business.Dimension);
        Assert.Equal(4, business.Answered);
        Assert.Equal(4, business.Total);
        Assert.Equal(16m, business.Points);
        Assert.Equal(32m, business.MaxPoints);
        Assert.Equal(50m, business.Pct);
        Assert.Equal(11m, business.WeightPct);

        // Los puntos por dimensión suman el total.
        Assert.Equal(result.Points, result.Dimensions.Sum(d => d.Points));
        Assert.Equal(result.MaxPoints, result.Dimensions.Sum(d => d.MaxPoints));
    }

    [Fact]
    public async Task UnansweredQuestions_CountAsZeroAndAreNotCountedAsAnswered()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        InitiativeEvaluation result = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput([false, false, false, false, false, false],
                new Dictionary<string, int> { ["N1"] = 4 }, 6),
            SavedAt);

        Assert.Equal(8m, result.Points);
        Assert.Equal(1, result.Dimensions[0].Answered);
        Assert.Equal(0, result.Dimensions[1].Answered);
    }

    // ── Bordes ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task EmptyAnswers_ScoreZeroAndFallInTheSmallestBand()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        InitiativeEvaluation result = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput([false, false, false, false, false, false], new Dictionary<string, int>(), 6),
            SavedAt);

        Assert.Equal(0m, result.Points);
        Assert.Equal(0m, result.Pct);
        Assert.Equal("XS", result.Talla);
        Assert.Equal(TriageVerdict.FastTrack, result.TriageVerdict);
    }

    [Fact]
    public async Task AllTopAnswers_ScoreAHundredPercentAndFallInTheLargestBand()
    {
        EvaluationModelDto model = await ReferenceModelAsync();
        var answers = model.Questions.ToDictionary(q => q.Id, _ => EvaluationEngine.ScoreMax);

        InitiativeEvaluation result = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput([true, true, true, true, true, true], answers, 1),
            SavedAt);

        Assert.Equal(280m, result.Points);
        Assert.Equal(100m, result.Pct);
        Assert.Equal("XL", result.Talla);
        Assert.Equal(14m, result.FteExpected);
        Assert.Equal(TriageVerdict.Required, result.TriageVerdict);
    }

    [Fact]
    public async Task AnswerAboveTheScale_IsClampedInsteadOfInflatingTheScore()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        InitiativeEvaluation result = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput([false, false, false, false, false, false],
                new Dictionary<string, int> { ["N1"] = 99 }, 6),
            SavedAt);

        // N1 pesa 2: recortada a 4 aporta 8 puntos, no 198.
        Assert.Equal(8m, result.Points);
    }

    [Fact]
    public async Task ZeroMonths_IsReadAsOneInsteadOfDividingByZero()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        InitiativeEvaluation result = EvaluationEngine.Evaluate(
            model,
            new EvaluationInput([false, false, false, false, false, false], new Dictionary<string, int>(), 0),
            SavedAt);

        Assert.Equal(1, result.TargetMonths);
        Assert.Equal(0.75m, result.FteExpected);
    }

    // ── Veredicto del tamizaje ────────────────────────────────────────────────

    [Fact]
    public async Task Triage_WithACriticalYes_RequiresEvenWithASingleYes()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        // T2 es crítica.
        Assert.Equal(TriageVerdict.Required, EvaluationEngine.VerdictFor(
            model, [false, true, false, false, false, false]));
    }

    [Fact]
    public async Task Triage_WithThreeNonCriticalYes_Requires()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        Assert.Equal(TriageVerdict.Required, EvaluationEngine.VerdictFor(
            model, [true, false, false, true, true, false]));
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    public async Task Triage_WithOneOrTwoNonCriticalYes_Recommends(int yes)
    {
        EvaluationModelDto model = await ReferenceModelAsync();
        bool[] triage = [yes >= 1, false, false, yes >= 2, false, false];

        Assert.Equal(TriageVerdict.Recommended, EvaluationEngine.VerdictFor(model, triage));
    }

    [Fact]
    public async Task Triage_WithNoYes_FastTracks()
    {
        EvaluationModelDto model = await ReferenceModelAsync();

        Assert.Equal(TriageVerdict.FastTrack, EvaluationEngine.VerdictFor(
            model, [false, false, false, false, false, false]));
    }

    // ── Snapshot ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task Result_KeepsTheInputsItWasComputedFrom()
    {
        EvaluationModelDto model = await ReferenceModelAsync();
        var answers = new Dictionary<string, int> { ["N1"] = 2, ["N2"] = 3 };

        InitiativeEvaluation result = EvaluationEngine.Evaluate(
            model, new EvaluationInput([true, false, false, false, false, false], answers, 6), SavedAt);

        Assert.Equal([true, false, false, false, false, false], result.Triage);
        Assert.Equal(answers, result.Answers);
        Assert.Equal(6, result.TargetMonths);
        Assert.Equal(SavedAt, result.SavedAtUtc);
    }
}
