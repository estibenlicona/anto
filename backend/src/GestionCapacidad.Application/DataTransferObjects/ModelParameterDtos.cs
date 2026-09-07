namespace GestionCapacidad.Application.DataTransferObjects;

/// <summary>
/// El calendario de sprints tal como viaja en el contrato. Sin horas por
/// semana, tolerancia de reporte ni puntos por FTE: la plataforma no registra
/// horas y el FTE mide capacidad, no demanda.
/// </summary>
public sealed record SprintConfigDto(
    int Weeks,
    int SprintsPerQuarter,
    decimal HoursPerSprint,
    string SprintCloseTime,
    int HistoryWindowSprints,
    int MinHistorySprints);

/// <summary>
/// Las bandas de talla: los cuatro cortes interiores de porcentaje y las cinco
/// bandas. Los cortes 0 y 100 no viajan porque no se mueven.
/// </summary>
public sealed record TallaBandsDto(
    IReadOnlyList<decimal> Boundaries,
    IReadOnlyList<TallaBandDto> Bands);

public sealed record TallaBandDto(
    string Talla,
    decimal PmMin,
    decimal PmMax,
    string Lectura);

/// <summary>
/// Una capacidad del mix. <c>Id</c> es la identidad estable de la fila
/// (el nombre es editable) y <c>PorTalla</c> indexa las cantidades por talla.
/// </summary>
public sealed record CapabilityMixRowDto(
    string Id,
    string Capacidad,
    IReadOnlyDictionary<string, int> PorTalla);

/// <summary>Una pregunta del pool de scoring; <c>Id</c> es su código estable.</summary>
public sealed record QuestionPoolRowDto(
    string Id,
    string Dimension,
    string Texto,
    int Peso);
