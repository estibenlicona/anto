using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Estimation;

public sealed record ModelDimensionDto(string Code, string Name, int Order, bool Active);

public sealed record ModelDriverDto(
    string Code,
    string Description,
    IReadOnlyList<EstimationOutput> Outputs);

/// <summary>
/// Una opción de respuesta con su puntaje normalizado entre 0 y 1. En una
/// pregunta cuantitativa <see cref="From"/> y <see cref="To"/> delimitan el
/// tramo: <c>From</c> exclusivo salvo en el primero, <c>To</c> inclusivo, y
/// <c>To</c> nulo en el último significa "sin tope".
/// </summary>
public sealed record QuestionOptionDto(string Label, decimal Score, decimal? From, decimal? To);

/// <summary>
/// Una pregunta de una versión del modelo. <see cref="Weights"/> es la fila de
/// la matriz pregunta × salida: una salida ausente del diccionario es "no
/// aporta", que no es lo mismo que un peso de cero.
/// </summary>
public sealed record ModelQuestionDto(
    string Id,
    string Dimension,
    string Text,
    EstimationQuestionType Type,
    string? Unit,
    string Driver,
    bool Active,
    IReadOnlyList<QuestionOptionDto> Options,
    IReadOnlyDictionary<EstimationOutput, decimal> Weights);

public sealed record EstimationTriageQuestionDto(string Id, string Text, bool Critical);

/// <summary>
/// Una banda de talla con sus tres parámetros de esfuerzo. <see cref="PmExpected"/>
/// es un parámetro propio y no el punto medio de <see cref="PmMin"/> y
/// <see cref="PmMax"/>.
/// </summary>
public sealed record TallaRuleDto(
    string Talla,
    decimal MinPct,
    decimal MaxPct,
    decimal PmMin,
    decimal PmExpected,
    decimal PmMax,
    string Lectura,
    string Action);

public sealed record RiskBandDto(string Level, decimal MaxPct);

/// <summary>El mix base de una capacidad, en porcentaje por talla.</summary>
public sealed record MixRowDto(string Capability, IReadOnlyDictionary<string, decimal> ByTalla);

public sealed record MixAdjustmentDto(string Capability, decimal Points);

/// <summary>
/// Un ajuste del mix base disparado por el puntaje de un driver. Reparte y no
/// agrega: sus <see cref="Adjustments"/> suman cero puntos porcentuales.
/// </summary>
public sealed record MixModifierDto(
    string Code,
    string Driver,
    string Operator,
    decimal Value,
    IReadOnlyList<string> Tallas,
    IReadOnlyList<MixAdjustmentDto> Adjustments);

/// <summary>
/// El contenido completo de una versión del modelo: lo que el motor necesita
/// para calcular, y lo único que necesita. Que sea inmutable del lado del
/// dominio es lo que permite que una estimación la referencie en vez de
/// copiarla (design.md — D3).
/// </summary>
public sealed record EstimationModelVersionDto(
    string ModelId,
    string VersionId,
    int VersionNumber,
    IReadOnlyList<ModelDimensionDto> Dimensions,
    IReadOnlyList<ModelDriverDto> Drivers,
    IReadOnlyList<ModelQuestionDto> Questions,
    IReadOnlyList<EstimationTriageQuestionDto> Triage,
    IReadOnlyList<TallaRuleDto> TallaRules,
    IReadOnlyList<RiskBandDto> RiskBands,
    IReadOnlyList<MixRowDto> Mix,
    IReadOnlyList<MixModifierDto> MixModifiers);

/// <summary>
/// Lo que respondió el usuario, sin normalizar: o el índice de la opción que
/// eligió, o el número que escribió. Se guarda crudo para poder reconstruir el
/// cálculo.
/// </summary>
public sealed record RawAnswer(int? Option, decimal? Number)
{
    public static RawAnswer FromOption(int index) => new(index, null);

    public static RawAnswer FromNumber(decimal value) => new(null, value);
}

public sealed record EstimationInput(
    IReadOnlyList<bool> Triage,
    IReadOnlyDictionary<string, RawAnswer> Answers,
    int TargetMonths);

/// <summary>
/// El puntaje de una salida. <see cref="Contributes"/> son las preguntas que
/// declaran peso en ella; una que no aporta no está en la lista, y una que pesa
/// cero sí.
/// </summary>
public sealed record OutputScore(
    decimal Points,
    decimal MaxPoints,
    decimal Pct,
    IReadOnlyList<string> Contributes);

public sealed record RiskScore(
    decimal Points,
    decimal MaxPoints,
    decimal Pct,
    string Level,
    IReadOnlyList<string> Contributes);

public sealed record DimensionScore(
    string Dimension,
    int Answered,
    int Total,
    decimal Points,
    decimal MaxPoints,
    int Pct,
    int WeightPct);

public sealed record MixDemand(string Capability, decimal Pct, decimal Fte);

/// <summary>
/// La traza de una respuesta: qué se respondió, en qué opción cayó, cuánto vale
/// normalizada, a qué driver alimenta y con qué peso llega a cada salida. Es lo
/// que hace auditable el cálculo.
/// </summary>
public sealed record AnswerDerivation(
    string QuestionId,
    string Raw,
    string OptionLabel,
    decimal Score,
    string Driver,
    IReadOnlyDictionary<EstimationOutput, decimal> Weights);

public sealed record EstimationResult(
    OutputScore Size,
    OutputScore Effort,
    RiskScore Risk,
    string Talla,
    decimal PmMin,
    decimal PmExpected,
    decimal PmMax,
    decimal FteMin,
    decimal FteExpected,
    decimal FteMax,
    IReadOnlyList<DimensionScore> Dimensions,
    IReadOnlyList<MixDemand> Mix,
    IReadOnlyList<string> MixModifiersApplied,
    IReadOnlyList<AnswerDerivation> Derivations,
    int Answered,
    int TotalQuestions,
    int TriageYes,
    string TriageVerdict);
