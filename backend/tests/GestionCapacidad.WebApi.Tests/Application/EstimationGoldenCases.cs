using System.Globalization;
using System.Text.Json;
using GestionCapacidad.Application.Estimation;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed record GoldenOutputExpectation(
    decimal Points,
    decimal MaxPoints,
    decimal Pct,
    string? Level,
    IReadOnlyList<string> Contributes);

public sealed record GoldenDimensionExpectation(
    string Dimension,
    int Answered,
    int Total,
    decimal Points,
    decimal MaxPoints,
    int Pct,
    int WeightPct);

public sealed record GoldenMixExpectation(string Capability, decimal Pct, decimal Fte);

public sealed record GoldenDerivationExpectation(
    string QuestionId,
    string Raw,
    string OptionLabel,
    decimal Score,
    string Driver,
    IReadOnlyDictionary<EstimationOutput, decimal> Weights);

public sealed record GoldenExpectation(
    GoldenOutputExpectation Size,
    GoldenOutputExpectation Effort,
    GoldenOutputExpectation Risk,
    string Talla,
    decimal PmMin,
    decimal PmExpected,
    decimal PmMax,
    decimal FteMin,
    decimal FteExpected,
    decimal FteMax,
    IReadOnlyList<GoldenDimensionExpectation> Dimensions,
    IReadOnlyList<GoldenMixExpectation> Mix,
    IReadOnlyList<string> MixModifiersApplied,
    IReadOnlyList<GoldenDerivationExpectation> Derivations,
    int Answered,
    int TotalQuestions,
    int TriageYes,
    string TriageVerdict);

public sealed record GoldenCase(
    string Name,
    string Why,
    EstimationModelVersionDto Model,
    EstimationInput Input,
    GoldenExpectation Expected);

/// <summary>
/// Carga <c>fixtures/estimation-model/casos-dorados.json</c>, el mismo archivo
/// que lee la suite del frontend. Si este cargador apuntara a una copia, las dos
/// implementaciones del motor dejarían de estar atadas y la protección contra
/// divergencia sería decorativa (design.md — D5).
/// </summary>
public static class EstimationGoldenCases
{
    private static readonly Lazy<(decimal Tolerance, IReadOnlyList<GoldenCase> Cases)> Loaded = new(Load);

    public static decimal Tolerance => Loaded.Value.Tolerance;

    public static IReadOnlyList<GoldenCase> All => Loaded.Value.Cases;

    /// <summary>Los nombres, para alimentar los <c>[MemberData]</c> de xunit.</summary>
    public static IEnumerable<object[]> Names => All.Select(c => new object[] { c.Name });

    public static GoldenCase ByName(string name) =>
        All.FirstOrDefault(c => c.Name == name)
        ?? throw new InvalidOperationException($"No hay caso dorado llamado «{name}».");

    public static string FixturesDirectory()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null)
        {
            string candidate = Path.Combine(directory.FullName, "fixtures", "estimation-model");
            if (Directory.Exists(candidate))
            {
                return candidate;
            }

            directory = directory.Parent;
        }

        throw new InvalidOperationException(
            $"No encontré fixtures/estimation-model subiendo desde {AppContext.BaseDirectory}.");
    }

    private static (decimal, IReadOnlyList<GoldenCase>) Load()
    {
        string path = Path.Combine(FixturesDirectory(), "casos-dorados.json");
        using JsonDocument document = JsonDocument.Parse(File.ReadAllText(path));
        JsonElement root = document.RootElement;

        decimal tolerance = root.GetProperty("tolerance").GetDecimal();

        var models = new Dictionary<string, EstimationModelVersionDto>(StringComparer.Ordinal);
        foreach (JsonProperty model in root.GetProperty("models").EnumerateObject())
        {
            models[model.Name] = ReadModel(model.Value);
        }

        var cases = new List<GoldenCase>();
        foreach (JsonElement element in root.GetProperty("cases").EnumerateArray())
        {
            string modelName = element.GetProperty("model").GetString()!;
            cases.Add(new GoldenCase(
                Name: element.GetProperty("name").GetString()!,
                Why: element.GetProperty("why").GetString()!,
                Model: models[modelName],
                Input: ReadInput(element.GetProperty("input")),
                Expected: ReadExpectation(element.GetProperty("expected"))));
        }

        return (tolerance, cases);
    }

    private static EstimationModelVersionDto ReadModel(JsonElement element) => new(
        ModelId: element.GetProperty("modelId").GetString()!,
        VersionId: element.GetProperty("versionId").GetString()!,
        VersionNumber: element.GetProperty("versionNumber").GetInt32(),
        Dimensions: [.. element.GetProperty("dimensions").EnumerateArray().Select(d => new ModelDimensionDto(
            d.GetProperty("code").GetString()!,
            d.GetProperty("name").GetString()!,
            d.GetProperty("order").GetInt32(),
            d.GetProperty("active").GetBoolean()))],
        Drivers: [.. element.GetProperty("drivers").EnumerateArray().Select(d => new ModelDriverDto(
            d.GetProperty("code").GetString()!,
            d.GetProperty("description").GetString()!,
            [.. d.GetProperty("outputs").EnumerateArray().Select(o => ParseOutput(o.GetString()!))]))],
        Questions: [.. element.GetProperty("questions").EnumerateArray().Select(ReadQuestion)],
        Triage: [.. element.GetProperty("triage").EnumerateArray().Select(t => new EstimationTriageQuestionDto(
            t.GetProperty("id").GetString()!,
            t.GetProperty("text").GetString()!,
            t.GetProperty("critical").GetBoolean()))],
        TallaRules: [.. element.GetProperty("tallaRules").EnumerateArray().Select(r => new TallaRuleDto(
            r.GetProperty("talla").GetString()!,
            r.GetProperty("minPct").GetDecimal(),
            r.GetProperty("maxPct").GetDecimal(),
            r.GetProperty("pmMin").GetDecimal(),
            r.GetProperty("pmExpected").GetDecimal(),
            r.GetProperty("pmMax").GetDecimal(),
            r.GetProperty("lectura").GetString()!,
            r.GetProperty("action").GetString()!))],
        RiskBands: [.. element.GetProperty("riskBands").EnumerateArray().Select(b => new RiskBandDto(
            b.GetProperty("level").GetString()!,
            b.GetProperty("maxPct").GetDecimal()))],
        Mix: [.. element.GetProperty("mix").EnumerateArray().Select(m => new MixRowDto(
            m.GetProperty("capability").GetString()!,
            m.GetProperty("byTalla").EnumerateObject().ToDictionary(p => p.Name, p => p.Value.GetDecimal(), StringComparer.Ordinal)))],
        MixModifiers: [.. element.GetProperty("mixModifiers").EnumerateArray().Select(m => new MixModifierDto(
            m.GetProperty("code").GetString()!,
            m.GetProperty("driver").GetString()!,
            m.GetProperty("operator").GetString()!,
            m.GetProperty("value").GetDecimal(),
            [.. m.GetProperty("tallas").EnumerateArray().Select(t => t.GetString()!)],
            [.. m.GetProperty("adjustments").EnumerateArray().Select(a => new MixAdjustmentDto(
                a.GetProperty("capability").GetString()!,
                a.GetProperty("points").GetDecimal()))]))]);

    private static ModelQuestionDto ReadQuestion(JsonElement element) => new(
        Id: element.GetProperty("id").GetString()!,
        Dimension: element.GetProperty("dimension").GetString()!,
        Text: element.GetProperty("text").GetString()!,
        Type: Enum.Parse<EstimationQuestionType>(element.GetProperty("type").GetString()!),
        Unit: element.TryGetProperty("unit", out JsonElement unit) ? unit.GetString() : null,
        Driver: element.GetProperty("driver").GetString()!,
        Active: element.GetProperty("active").GetBoolean(),
        Options: [.. element.GetProperty("options").EnumerateArray().Select(o => new QuestionOptionDto(
            o.GetProperty("label").GetString()!,
            o.GetProperty("score").GetDecimal(),
            ReadNullableDecimal(o, "from"),
            ReadNullableDecimal(o, "to")))],
        Weights: ReadWeights(element.GetProperty("weights")));

    private static IReadOnlyDictionary<EstimationOutput, decimal> ReadWeights(JsonElement element) =>
        element.EnumerateObject().ToDictionary(p => ParseOutput(p.Name), p => p.Value.GetDecimal());

    private static decimal? ReadNullableDecimal(JsonElement element, string name) =>
        element.TryGetProperty(name, out JsonElement value) && value.ValueKind is not JsonValueKind.Null
            ? value.GetDecimal()
            : null;

    private static EstimationOutput ParseOutput(string value) => Enum.Parse<EstimationOutput>(value);

    private static EstimationInput ReadInput(JsonElement element) => new(
        Triage: [.. element.GetProperty("triage").EnumerateArray().Select(t => t.GetBoolean())],
        Answers: element.GetProperty("answers").EnumerateObject().ToDictionary(
            p => p.Name,
            p => new RawAnswer(
                p.Value.TryGetProperty("option", out JsonElement option) ? option.GetInt32() : null,
                ReadNullableDecimal(p.Value, "number")),
            StringComparer.Ordinal),
        TargetMonths: element.GetProperty("targetMonths").GetInt32());

    private static GoldenExpectation ReadExpectation(JsonElement element) => new(
        Size: ReadOutput(element.GetProperty("size")),
        Effort: ReadOutput(element.GetProperty("effort")),
        Risk: ReadOutput(element.GetProperty("risk")),
        Talla: element.GetProperty("talla").GetString()!,
        PmMin: element.GetProperty("pmMin").GetDecimal(),
        PmExpected: element.GetProperty("pmExpected").GetDecimal(),
        PmMax: element.GetProperty("pmMax").GetDecimal(),
        FteMin: element.GetProperty("fteMin").GetDecimal(),
        FteExpected: element.GetProperty("fteExpected").GetDecimal(),
        FteMax: element.GetProperty("fteMax").GetDecimal(),
        Dimensions: [.. element.GetProperty("dimensions").EnumerateArray().Select(d => new GoldenDimensionExpectation(
            d.GetProperty("dimension").GetString()!,
            d.GetProperty("answered").GetInt32(),
            d.GetProperty("total").GetInt32(),
            d.GetProperty("points").GetDecimal(),
            d.GetProperty("maxPoints").GetDecimal(),
            d.GetProperty("pct").GetInt32(),
            d.GetProperty("weightPct").GetInt32()))],
        Mix: [.. element.GetProperty("mix").EnumerateArray().Select(m => new GoldenMixExpectation(
            m.GetProperty("capability").GetString()!,
            m.GetProperty("pct").GetDecimal(),
            m.GetProperty("fte").GetDecimal()))],
        MixModifiersApplied: [.. element.GetProperty("mixModifiersApplied").EnumerateArray().Select(m => m.GetString()!)],
        Derivations: element.TryGetProperty("derivations", out JsonElement derivations)
            ? [.. derivations.EnumerateArray().Select(d => new GoldenDerivationExpectation(
                d.GetProperty("questionId").GetString()!,
                d.GetProperty("raw").GetString()!,
                d.GetProperty("optionLabel").GetString()!,
                d.GetProperty("score").GetDecimal(),
                d.GetProperty("driver").GetString()!,
                ReadWeights(d.GetProperty("weights"))))]
            : [],
        Answered: element.GetProperty("answered").GetInt32(),
        TotalQuestions: element.GetProperty("totalQuestions").GetInt32(),
        TriageYes: element.GetProperty("triageYes").GetInt32(),
        TriageVerdict: element.GetProperty("triageVerdict").GetString()!);

    private static GoldenOutputExpectation ReadOutput(JsonElement element) => new(
        Points: element.GetProperty("points").GetDecimal(),
        MaxPoints: element.GetProperty("maxPoints").GetDecimal(),
        Pct: element.GetProperty("pct").GetDecimal(),
        Level: element.TryGetProperty("level", out JsonElement level) ? level.GetString() : null,
        Contributes: [.. element.GetProperty("contributes").EnumerateArray().Select(c => c.GetString()!)]);

    /// <summary>Formatea un decimal igual en cualquier cultura, para los mensajes de fallo.</summary>
    public static string Text(decimal value) => value.ToString(CultureInfo.InvariantCulture);
}
