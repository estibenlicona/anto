namespace GestionCapacidad.Application.DataTransferObjects;

/// <summary>
/// Una versión en la lista de Parámetros: lo que se necesita para decidir qué
/// hacer con ella, sin traer su contenido. <see cref="EstimationsCount"/> es lo
/// que convierte una fila en una decisión: una versión que ya calculó
/// estimaciones no se toca, se copia.
/// </summary>
public sealed record ModelVersionListItemDto(
    string Id,
    int Number,
    string Status,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    string? ChangeNote,
    int EstimationsCount);

public sealed record EstimationModelListItemDto(
    string Id,
    string Name,
    string Phase,
    IReadOnlyList<ModelVersionListItemDto> Versions);

/// <summary>
/// Un resultado de la validación. <see cref="Section"/> es a dónde lleva la
/// acción de arreglarlo: un impedimento que no dice dónde se corrige obliga a
/// buscar a mano.
/// </summary>
public sealed record ModelValidationCheckDto(
    string Code,
    string Title,
    string Status,
    string? Missing,
    string Section);

public sealed record ModelValidationReportDto(
    IReadOnlyList<ModelValidationCheckDto> Checks,
    int ImpedimentCount,
    int WarningCount,
    bool CanPublish);

/// <summary>Un cambio del borrador respecto de la versión con la que se compara.</summary>
public sealed record ModelVersionDiffEntryDto(
    string Section,
    string Item,
    string Kind,
    string? Before,
    string? After);

public sealed record ModelVersionDiffDto(
    int? FromVersion,
    int ToVersion,
    IReadOnlyList<ModelVersionDiffEntryDto> Entries);

public sealed record ModelChangeEntryDto(
    DateTime OccurredAtUtc,
    string Author,
    string Section,
    string Summary);

// ── Cuerpos de las escrituras ────────────────────────────────────────────────
//
// El autor viaja en cada request desde la sesión del cliente: la API todavía no
// valida el token de quien llama, así que la firma es declarativa y no una
// identidad verificada (design.md — D7). Sin autor no se guarda: un historial
// con entradas anónimas no sirve para lo que existe.

public sealed record ModelDimensionInput(string Code, string Name, int Order, bool Active);

public sealed record QuestionOptionInput(string Label, decimal Score, decimal? From, decimal? To);

public sealed record ModelQuestionInput(
    string Code,
    string DimensionCode,
    string Texto,
    string Type,
    string? Unit,
    string DriverCode,
    bool Active,
    IReadOnlyList<QuestionOptionInput> Options);

public sealed record TriageQuestionInput(string Code, string Texto, bool Critical);

public sealed record SaveDimensionsRequest(
    string Author,
    IReadOnlyList<ModelDimensionInput> Dimensions,
    IReadOnlyList<ModelQuestionInput> Questions,
    IReadOnlyList<TriageQuestionInput> Triage);

public sealed record ModelDriverInput(string Code, string Description, IReadOnlyList<string> Outputs);

/// <summary>
/// La fila de pesos de una pregunta. Una salida **ausente** del diccionario es
/// "no aporta", que no es lo mismo que un peso de cero: el cliente manda o no
/// manda la clave, y esa ausencia es el dato.
/// </summary>
public sealed record QuestionWeightsInput(
    string QuestionCode,
    IReadOnlyDictionary<string, decimal> Weights);

public sealed record SaveDriversRequest(
    string Author,
    IReadOnlyList<ModelDriverInput> Drivers,
    IReadOnlyList<QuestionWeightsInput> Weights);

public sealed record TallaRuleInput(
    string Talla,
    decimal PmMin,
    decimal PmExpected,
    decimal PmMax,
    string Lectura,
    string Action);

public sealed record RiskBandInput(string Level, decimal MaxPct);

public sealed record SaveTallaRulesRequest(
    string Author,
    IReadOnlyList<decimal> Boundaries,
    IReadOnlyList<TallaRuleInput> Rules,
    IReadOnlyList<RiskBandInput> RiskBands);

public sealed record MixRowInput(
    string Key,
    string Capacidad,
    IReadOnlyDictionary<string, decimal> PorTalla);

public sealed record MixAdjustmentInput(string CapabilityKey, decimal Points);

public sealed record MixModifierInput(
    string Code,
    string DriverCode,
    string Operator,
    decimal Threshold,
    IReadOnlyList<string> Tallas,
    IReadOnlyList<MixAdjustmentInput> Adjustments);

public sealed record SaveMixRequest(
    string Author,
    IReadOnlyList<MixRowInput> Mix,
    IReadOnlyList<MixModifierInput> Modifiers);

public sealed record CreateModelVersionRequest(string Author, int SourceVersion);

public sealed record PublishModelVersionRequest(
    string Author,
    DateOnly EffectiveFrom,
    string Note);
