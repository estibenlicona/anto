namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// Lo que aportó una dimensión al puntaje de la evaluación.
/// </summary>
public sealed record EvaluationDimensionResult(
    string Dimension,
    int Answered,
    int Total,
    decimal Points,
    decimal MaxPoints,
    decimal Pct,
    decimal WeightPct);

/// <summary>
/// Una capacidad de la composición sugerida para la talla resultante:
/// cuánta gente pide, qué porcentaje del equipo representa y cuánto FTE le
/// toca de la demanda esperada.
/// </summary>
public sealed record EvaluationMixResult(
    string Capability,
    decimal People,
    decimal CompositionPct,
    decimal Fte);

/// <summary>
/// La evaluación de dimensionamiento de una iniciativa, guardada como
/// **snapshot**: los insumos con los que se calculó (tamizaje, respuestas y
/// plazo) junto a todo lo derivado en el momento de guardar.
///
/// Es un snapshot y no un cálculo al leer porque el modelo es editable desde
/// Admin: cambiar una banda o un peso debe afectar la **siguiente**
/// evaluación, no reescribir el tamaño de las que ya se acordaron. Editar el
/// plazo sí re-evalúa —el FTE es persona-mes sobre meses— pero con las mismas
/// respuestas, así que puntos y talla no se mueven.
/// </summary>
public sealed record InitiativeEvaluation(
    IReadOnlyList<bool> Triage,
    IReadOnlyDictionary<string, int> Answers,
    int TargetMonths,
    decimal Points,
    decimal MaxPoints,
    decimal Pct,
    string Talla,
    decimal PmMin,
    decimal PmMax,
    decimal FteExpected,
    decimal FteMin,
    decimal FteMax,
    IReadOnlyList<EvaluationDimensionResult> Dimensions,
    IReadOnlyList<EvaluationMixResult> Mix,
    TriageVerdict TriageVerdict,
    DateTime SavedAtUtc);
