using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Initiatives;

/// <summary>Los insumos de una evaluación: tamizaje, respuestas y plazo.</summary>
public sealed record EvaluationInput(
    IReadOnlyList<bool> Triage,
    IReadOnlyDictionary<string, int> Answers,
    int TargetMonths);

/// <summary>
/// El motor de dimensionamiento. Dado el modelo vigente y las respuestas,
/// produce puntaje, talla, FTE y composición sugerida.
///
/// Es espejo del motor del frontend (<c>evaluationModel.ts</c>), que la
/// pantalla usa para la vista en vivo mientras se responde: los dos tienen que
/// dar el mismo número sobre las mismas entradas, o el usuario vería una talla
/// al responder y otra al guardar. Los tests fijan los valores exactos que
/// produce el otro lado.
/// </summary>
public static class EvaluationEngine
{
    /// <summary>El tope de la escala de respuesta: 0 a 4.</summary>
    public const int ScoreMax = 4;

    public static InitiativeEvaluation Evaluate(
        EvaluationModelDto model,
        EvaluationInput input,
        DateTime savedAtUtc)
    {
        ArgumentNullException.ThrowIfNull(model);
        ArgumentNullException.ThrowIfNull(input);

        // Un plazo de cero dividiría por cero: se lee como un mes, igual que
        // en el frontend.
        int months = Math.Max(1, input.TargetMonths);

        decimal maxPoints = model.Questions.Sum(q => ScoreMax * q.Weight);
        decimal points = model.Questions.Sum(q => ValueOf(input, q) * q.Weight);
        decimal pct = maxPoints > 0 ? Round1(points / maxPoints * 100m) : 0m;

        TallaBandModelDto band = BandFor(model, pct);

        var dimensions = new List<EvaluationDimensionResult>(model.Dimensions.Count);
        foreach (string dimension in model.Dimensions)
        {
            List<EvaluationQuestionDto> questions =
                [.. model.Questions.Where(q => string.Equals(q.Dimension, dimension, StringComparison.Ordinal))];

            decimal dimensionMax = questions.Sum(q => ScoreMax * q.Weight);
            decimal dimensionPoints = questions.Sum(q => ValueOf(input, q) * q.Weight);

            dimensions.Add(new EvaluationDimensionResult(
                Dimension: dimension,
                Answered: questions.Count(q => input.Answers.ContainsKey(q.Id)),
                Total: questions.Count,
                Points: dimensionPoints,
                MaxPoints: dimensionMax,
                Pct: dimensionMax > 0 ? Math.Round(dimensionPoints / dimensionMax * 100m, MidpointRounding.AwayFromZero) : 0m,
                WeightPct: maxPoints > 0 ? Math.Round(dimensionMax / maxPoints * 100m, MidpointRounding.AwayFromZero) : 0m));
        }

        decimal fteExpected = (band.PmMin + band.PmMax) / 2m / months;
        decimal fteMin = band.PmMin / months;
        decimal fteMax = band.PmMax / months;

        // Sólo las capacidades que la talla pide: una fila en cero no es
        // composición, es ruido en la tarjeta.
        var staffed = model.Mix
            .Select(m => (m.Capability, People: m.ByTalla.GetValueOrDefault(band.Talla, 0)))
            .Where(m => m.People > 0)
            .ToList();

        int totalPeople = staffed.Sum(m => m.People);
        var mix = staffed
            .Select(m => new EvaluationMixResult(
                Capability: m.Capability,
                People: m.People,
                CompositionPct: totalPeople > 0
                    ? Math.Round((decimal)m.People / totalPeople * 100m, MidpointRounding.AwayFromZero)
                    : 0m,
                // El FTE de la capacidad no se redondea: los redondeos de tres
                // porciones no suman el total.
                Fte: totalPeople > 0 ? (decimal)m.People / totalPeople * fteExpected : 0m))
            .ToList();

        return new InitiativeEvaluation(
            Triage: [.. input.Triage],
            Answers: input.Answers.ToDictionary(pair => pair.Key, pair => pair.Value),
            TargetMonths: months,
            Points: points,
            MaxPoints: maxPoints,
            Pct: pct,
            Talla: band.Talla,
            PmMin: band.PmMin,
            PmMax: band.PmMax,
            FteExpected: fteExpected,
            FteMin: fteMin,
            FteMax: fteMax,
            Dimensions: dimensions,
            Mix: mix,
            TriageVerdict: VerdictFor(model, input.Triage),
            SavedAtUtc: savedAtUtc);
    }

    /// <summary>
    /// La banda que contiene el porcentaje; por encima de todas, la última.
    /// El fallback importa cuando los cortes de Admin no llegan hasta 100.
    /// </summary>
    public static TallaBandModelDto BandFor(EvaluationModelDto model, decimal pct) =>
        model.Bands.FirstOrDefault(b => pct <= b.MaxPct) ?? model.Bands[^1];

    /// <summary>
    /// Una crítica marcada, o tres o más síes, exigen acompañamiento; un sí lo
    /// recomienda; ninguno habilita la vía rápida.
    /// </summary>
    public static TriageVerdict VerdictFor(EvaluationModelDto model, IReadOnlyList<bool> triage)
    {
        int yes = triage.Count(t => t);
        bool critical = model.Triage
            .Where((question, index) => question.Critical && index < triage.Count && triage[index])
            .Any();

        if (critical || yes >= 3)
        {
            return TriageVerdict.Required;
        }

        return yes >= 1 ? TriageVerdict.Recommended : TriageVerdict.FastTrack;
    }

    /// <summary>Una pregunta sin responder vale cero; fuera de rango, se recorta.</summary>
    private static decimal ValueOf(EvaluationInput input, EvaluationQuestionDto question) =>
        input.Answers.TryGetValue(question.Id, out int value)
            ? Math.Clamp(value, 0, ScoreMax)
            : 0;

    private static decimal Round1(decimal value) =>
        Math.Round(value, 1, MidpointRounding.AwayFromZero);
}
