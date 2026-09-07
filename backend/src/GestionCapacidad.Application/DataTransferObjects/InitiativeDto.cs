namespace GestionCapacidad.Application.DataTransferObjects;

/// <summary>
/// Una iniciativa con lo guardado más lo derivado. <c>SquadHasOtherActive</c>
/// no se persiste: depende del resto de las iniciativas de la célula y
/// quedaría desactualizado en cuanto otra se active o se cierre, así que se
/// calcula al responder.
/// </summary>
public sealed record InitiativeDto(
    Guid Id,
    string Name,
    Guid SquadId,
    string SquadName,
    string ProductOwner,
    int TargetMonths,
    string Status,
    InitiativeEvaluationDto? Evaluation,
    DateTime CreatedAtUtc,
    bool SquadHasOtherActive);

/// <summary>
/// La evaluación guardada: los insumos con los que se calculó y todo lo que
/// el motor derivó de ellos en ese momento.
/// </summary>
public sealed record InitiativeEvaluationDto(
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
    IReadOnlyList<DimensionResultDto> Dimensions,
    IReadOnlyList<MixResultDto> Mix,
    string TriageVerdict,
    DateTime SavedAtUtc);

public sealed record DimensionResultDto(
    string Dimension,
    int Answered,
    int Total,
    decimal Points,
    decimal MaxPoints,
    decimal Pct,
    decimal WeightPct);

public sealed record MixResultDto(
    string Capability,
    decimal People,
    decimal CompositionPct,
    decimal Fte);

// ── El modelo de evaluación vigente ──────────────────────────────────────────

/// <summary>
/// El modelo con el que se evalúa: las preguntas y su peso, el tamizaje, las
/// bandas de talla y el mix de capacidades. Se compone en cada petición desde
/// los parámetros de Admin, así que un cambio guardado allá se refleja en la
/// siguiente evaluación.
/// </summary>
public sealed record EvaluationModelDto(
    IReadOnlyList<string> Dimensions,
    IReadOnlyList<EvaluationQuestionDto> Questions,
    IReadOnlyList<TriageQuestionDto> Triage,
    IReadOnlyList<TallaBandModelDto> Bands,
    IReadOnlyList<CapabilityMixModelDto> Mix);

/// <summary>
/// Una pregunta del modelo. <c>Kind</c> y <c>Scale</c> no salen del pool de
/// Admin —que sólo mantiene texto, peso y dimensión— sino del motor: dicen
/// cómo se responde la pregunta, no qué se pregunta.
/// </summary>
public sealed record EvaluationQuestionDto(
    string Id,
    string Dimension,
    string Text,
    decimal Weight,
    string Kind,
    IReadOnlyList<string> Scale);

public sealed record TriageQuestionDto(string Id, string Text, bool Critical);

/// <summary>
/// Una banda con su rango de porcentaje ya resuelto desde los cortes de Admin,
/// más la acción recomendada, que es del modelo y no del parámetro.
/// </summary>
public sealed record TallaBandModelDto(
    string Talla,
    decimal MinPct,
    decimal MaxPct,
    decimal PmMin,
    decimal PmMax,
    string Lectura,
    string Action);

public sealed record CapabilityMixModelDto(
    string Capability,
    IReadOnlyDictionary<string, int> ByTalla);

// ── Resumen ──────────────────────────────────────────────────────────────────

public sealed record InitiativesStatsDto(
    int Total,
    int Unevaluated,
    int Active,
    IReadOnlyList<TallaBucketDto> ActiveByTalla,
    decimal FteDemand);

public sealed record TallaBucketDto(string Talla, int Count);
