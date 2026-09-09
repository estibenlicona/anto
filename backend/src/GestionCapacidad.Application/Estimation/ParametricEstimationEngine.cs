using System.Globalization;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Estimation;

/// <summary>
/// El motor paramétrico: respuesta → opción → puntaje normalizado → driver →
/// peso por salida. Espejo de <c>computeEstimation</c> del frontend, atado a él
/// por los casos dorados de <c>fixtures/estimation-model/</c> (design.md — D5).
///
/// El algoritmo está escrito en <c>fixtures/estimation-model/README.md</c>: es
/// el contrato que las dos implementaciones tienen que cumplir, y donde se
/// discute cualquier cambio de reglas antes de tocar el código.
/// </summary>
public static class ParametricEstimationEngine
{
    /// <summary>El punto de la escala de esfuerzo en el que el resultado es el parámetro esperado.</summary>
    private const decimal EffortAnchorPct = 50m;

    private static readonly EstimationOutput[] ResultOutputs =
        [EstimationOutput.Size, EstimationOutput.Effort, EstimationOutput.Risk];

    public static EstimationResult Evaluate(
        EstimationModelVersionDto version,
        EstimationInput input)
    {
        ArgumentNullException.ThrowIfNull(version);
        ArgumentNullException.ThrowIfNull(input);

        // Un plazo de cero dividiría por cero: se lee como un mes.
        int months = Math.Max(1, input.TargetMonths);

        var activeDimensions = version.Dimensions
            .Where(d => d.Active)
            .Select(d => d.Code)
            .ToHashSet(StringComparer.Ordinal);

        List<ModelQuestionDto> active =
        [
            .. version.Questions.Where(q => q.Active && activeDimensions.Contains(q.Dimension)),
        ];

        // Se resuelve una vez por pregunta: la opción en la que cayó la
        // respuesta es lo que alimenta el puntaje, la derivación y el driver.
        Dictionary<string, QuestionOptionDto?> resolved = active.ToDictionary(
            q => q.Id,
            q => Resolve(q, input.Answers.GetValueOrDefault(q.Id)),
            StringComparer.Ordinal);

        decimal ScoreOf(ModelQuestionDto question) =>
            resolved.GetValueOrDefault(question.Id)?.Score ?? 0m;

        Dictionary<EstimationOutput, OutputScore> scores = ResultOutputs.ToDictionary(
            output => output,
            output => ScoreFor(active, output, ScoreOf));

        OutputScore size = scores[EstimationOutput.Size];
        OutputScore effort = scores[EstimationOutput.Effort];
        OutputScore riskScore = scores[EstimationOutput.Risk];

        TallaRuleDto rule = TallaFor(version, size.Pct);
        decimal pmExpected = ExpectedEffort(rule, effort.Pct);

        decimal fteExpected = pmExpected / months;
        var mix = MixFor(version, rule.Talla, fteExpected, active, ScoreOf, out List<string> applied);

        return new EstimationResult(
            Size: size,
            Effort: effort,
            Risk: new RiskScore(
                riskScore.Points,
                riskScore.MaxPoints,
                riskScore.Pct,
                RiskLevelFor(version, riskScore.Pct),
                riskScore.Contributes),
            Talla: rule.Talla,
            PmMin: rule.PmMin,
            PmExpected: pmExpected,
            PmMax: rule.PmMax,
            FteMin: rule.PmMin / months,
            FteExpected: fteExpected,
            FteMax: rule.PmMax / months,
            Dimensions: DimensionsFor(version, active, size.MaxPoints, input, ScoreOf),
            Mix: mix,
            MixModifiersApplied: applied,
            Derivations: DerivationsFor(active, resolved, input),
            Answered: active.Count(q => input.Answers.ContainsKey(q.Id)),
            TotalQuestions: active.Count,
            TriageYes: input.Triage.Count(t => t),
            TriageVerdict: VerdictFor(version, input.Triage));
    }

    /// <summary>
    /// El puntaje de una salida sobre las preguntas que **declaran** peso en
    /// ella. Una pregunta que no aporta queda fuera de la suma y fuera de
    /// <see cref="OutputScore.Contributes"/>; una con peso cero está en las dos.
    /// </summary>
    private static OutputScore ScoreFor(
        IReadOnlyList<ModelQuestionDto> active,
        EstimationOutput output,
        Func<ModelQuestionDto, decimal> scoreOf)
    {
        List<ModelQuestionDto> contributing = [.. active.Where(q => q.Weights.ContainsKey(output))];

        decimal maxPoints = contributing.Sum(q => q.Weights[output]);
        decimal points = contributing.Sum(q => q.Weights[output] * scoreOf(q));

        return new OutputScore(
            points,
            maxPoints,
            maxPoints > 0m ? Round1(points / maxPoints * 100m) : 0m,
            [.. contributing.Select(q => q.Id)]);
    }

    /// <summary>La talla que contiene el porcentaje; por encima de todas, la última.</summary>
    public static TallaRuleDto TallaFor(EstimationModelVersionDto version, decimal sizePct) =>
        version.TallaRules.FirstOrDefault(r => sizePct <= r.MaxPct) ?? version.TallaRules[^1];

    /// <summary>
    /// El esfuerzo esperado: <see cref="TallaRuleDto.PmExpected"/> es el ancla y
    /// el puntaje de esfuerzo interpola alrededor de él. Con el puntaje en la
    /// mitad de la escala da exactamente el parámetro — que es distinto del
    /// punto medio del rango, y por eso dos iniciativas de la misma talla ya no
    /// reciben la misma cifra.
    /// </summary>
    public static decimal ExpectedEffort(TallaRuleDto rule, decimal effortPct) => Round1(
        effortPct <= EffortAnchorPct
            ? rule.PmMin + ((rule.PmExpected - rule.PmMin) * (effortPct / EffortAnchorPct))
            : rule.PmExpected + ((rule.PmMax - rule.PmExpected) * ((effortPct - EffortAnchorPct) / EffortAnchorPct)));

    private static string RiskLevelFor(EstimationModelVersionDto version, decimal riskPct) =>
        (version.RiskBands.FirstOrDefault(b => riskPct <= b.MaxPct) ?? version.RiskBands[^1]).Level;

    /// <summary>
    /// El mix de la talla con sus modificadores aplicados. Un modificador
    /// reparte y no agrega, así que el porcentaje sigue sumando 100 y los FTE
    /// por perfil suman el FTE total. Los FTE no se redondean: tres porciones
    /// redondeadas no suman el total.
    /// </summary>
    private static IReadOnlyList<MixDemand> MixFor(
        EstimationModelVersionDto version,
        string talla,
        decimal fteExpected,
        IReadOnlyList<ModelQuestionDto> active,
        Func<ModelQuestionDto, decimal> scoreOf,
        out List<string> applied)
    {
        Dictionary<string, decimal> percentages = version.Mix.ToDictionary(
            m => m.Capability,
            m => m.ByTalla.GetValueOrDefault(talla, 0m),
            StringComparer.Ordinal);

        applied = [];
        foreach (MixModifierDto modifier in version.MixModifiers)
        {
            if (!modifier.Tallas.Contains(talla, StringComparer.Ordinal))
            {
                continue;
            }

            decimal? driverScore = DriverScore(active, modifier.Driver, scoreOf);
            if (driverScore is null)
            {
                continue;
            }

            bool triggers = string.Equals(modifier.Operator, "lte", StringComparison.OrdinalIgnoreCase)
                ? driverScore <= modifier.Value
                : driverScore >= modifier.Value;

            if (!triggers)
            {
                continue;
            }

            applied.Add(modifier.Code);
            foreach (MixAdjustmentDto adjustment in modifier.Adjustments)
            {
                percentages[adjustment.Capability] =
                    percentages.GetValueOrDefault(adjustment.Capability, 0m) + adjustment.Points;
            }
        }

        // Un perfil en cero no es composición, es ruido en la tarjeta.
        return
        [
            .. version.Mix
                .Select(m => (m.Capability, Pct: percentages[m.Capability]))
                .Where(m => m.Pct > 0m)
                .Select(m => new MixDemand(m.Capability, m.Pct, m.Pct / 100m * fteExpected)),
        ];
    }

    /// <summary>
    /// El puntaje de un driver: el promedio de sus preguntas activas ponderado
    /// por su peso en el mix. Sin preguntas que lo alimenten por ese eje, el
    /// driver no participa y sus modificadores no se disparan.
    /// </summary>
    private static decimal? DriverScore(
        IReadOnlyList<ModelQuestionDto> active,
        string driver,
        Func<ModelQuestionDto, decimal> scoreOf)
    {
        List<ModelQuestionDto> feeding =
        [
            .. active.Where(q =>
                string.Equals(q.Driver, driver, StringComparison.Ordinal)
                && q.Weights.ContainsKey(EstimationOutput.Mix)),
        ];

        decimal totalWeight = feeding.Sum(q => q.Weights[EstimationOutput.Mix]);

        return totalWeight > 0m
            ? feeding.Sum(q => q.Weights[EstimationOutput.Mix] * scoreOf(q)) / totalWeight
            : null;
    }

    /// <summary>
    /// El desglose por dimensión es sobre la salida de tamaño. Una dimensión
    /// cuyas preguntas no pesan en tamaño da cero, que es correcto: es lo que
    /// hace visible que una dimensión de riesgo no agranda la iniciativa.
    /// </summary>
    private static IReadOnlyList<DimensionScore> DimensionsFor(
        EstimationModelVersionDto version,
        IReadOnlyList<ModelQuestionDto> active,
        decimal sizeMaxPoints,
        EstimationInput input,
        Func<ModelQuestionDto, decimal> scoreOf)
    {
        var result = new List<DimensionScore>();

        foreach (ModelDimensionDto dimension in version.Dimensions.Where(d => d.Active).OrderBy(d => d.Order))
        {
            List<ModelQuestionDto> own =
            [
                .. active.Where(q => string.Equals(q.Dimension, dimension.Code, StringComparison.Ordinal)),
            ];

            List<ModelQuestionDto> contributing =
            [
                .. own.Where(q => q.Weights.ContainsKey(EstimationOutput.Size)),
            ];

            decimal maxPoints = contributing.Sum(q => q.Weights[EstimationOutput.Size]);
            decimal points = contributing.Sum(q => q.Weights[EstimationOutput.Size] * scoreOf(q));

            result.Add(new DimensionScore(
                Dimension: dimension.Code,
                Answered: own.Count(q => input.Answers.ContainsKey(q.Id)),
                Total: own.Count,
                Points: points,
                MaxPoints: maxPoints,
                Pct: maxPoints > 0m ? Round0(points / maxPoints * 100m) : 0,
                WeightPct: sizeMaxPoints > 0m ? Round0(maxPoints / sizeMaxPoints * 100m) : 0));
        }

        return result;
    }

    private static IReadOnlyList<AnswerDerivation> DerivationsFor(
        IReadOnlyList<ModelQuestionDto> active,
        IReadOnlyDictionary<string, QuestionOptionDto?> resolved,
        EstimationInput input)
    {
        var derivations = new List<AnswerDerivation>();

        foreach (ModelQuestionDto question in active)
        {
            if (!input.Answers.TryGetValue(question.Id, out RawAnswer? raw))
            {
                continue;
            }

            QuestionOptionDto? option = resolved.GetValueOrDefault(question.Id);
            if (option is null)
            {
                continue;
            }

            derivations.Add(new AnswerDerivation(
                QuestionId: question.Id,
                Raw: question.Type is EstimationQuestionType.Cuantitativa
                    ? (raw.Number ?? 0m).ToString(CultureInfo.InvariantCulture)
                    : option.Label,
                OptionLabel: option.Label,
                Score: option.Score,
                Driver: question.Driver,
                Weights: question.Weights));
        }

        return derivations;
    }

    /// <summary>La opción en la que cae una respuesta cruda, o <c>null</c> si no cae en ninguna.</summary>
    private static QuestionOptionDto? Resolve(ModelQuestionDto question, RawAnswer? answer)
    {
        if (answer is null)
        {
            return null;
        }

        if (question.Type is EstimationQuestionType.Cuantitativa)
        {
            if (answer.Number is not decimal number)
            {
                return null;
            }

            for (int i = 0; i < question.Options.Count; i++)
            {
                QuestionOptionDto option = question.Options[i];
                bool aboveFloor = option.From is null || (i == 0 ? number >= option.From : number > option.From);
                bool underCeiling = option.To is null || number <= option.To;

                if (aboveFloor && underCeiling)
                {
                    return option;
                }
            }

            return null;
        }

        return answer.Option is int index && index >= 0 && index < question.Options.Count
            ? question.Options[index]
            : null;
    }

    /// <summary>
    /// Una crítica marcada, o tres o más síes, exigen acompañamiento; un sí lo
    /// recomienda; ninguno habilita la vía rápida.
    /// </summary>
    public static string VerdictFor(EstimationModelVersionDto version, IReadOnlyList<bool> triage)
    {
        int yes = triage.Count(t => t);
        bool critical = version.Triage
            .Where((question, index) => question.Critical && index < triage.Count && triage[index])
            .Any();

        if (critical || yes >= 3)
        {
            return TriageVerdict.Required.Value;
        }

        return yes >= 1 ? TriageVerdict.Recommended.Value : TriageVerdict.FastTrack.Value;
    }

    private static decimal Round1(decimal value) =>
        Math.Round(value, 1, MidpointRounding.AwayFromZero);

    private static int Round0(decimal value) =>
        (int)Math.Round(value, 0, MidpointRounding.AwayFromZero);
}
