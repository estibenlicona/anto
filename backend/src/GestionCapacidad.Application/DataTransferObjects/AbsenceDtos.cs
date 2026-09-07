namespace GestionCapacidad.Application.DataTransferObjects;

/// <summary>
/// Las ausencias que tocan un mes. Todo el sobre está expresado contra ese
/// mes: <c>monthBusinessDays</c> es el denominador con el que se leen los
/// impactos de cada ausencia.
/// </summary>
public sealed record AbsencesMonthDto(
    string Month,
    decimal MonthBusinessDays,
    IReadOnlyList<AbsenceDto> Items);

/// <summary>
/// Una ausencia con lo guardado más lo derivado. Los días y los impactos no se
/// persisten: dependen del mes que se pregunte y de una dedicación que cambia
/// sin que la ausencia cambie.
/// </summary>
public sealed record AbsenceDto(
    Guid Id,
    Guid PersonId,
    string PersonName,
    /// <summary>Nombre del proveedor cuando la persona es de un tercero; nulo si es de planta.</summary>
    string? ProviderName,
    string Type,
    DateOnly StartDate,
    DateOnly EndDate,
    bool StartsHalfDay,
    bool EndsHalfDay,
    /// <summary>Días hábiles del rango completo; múltiplo de 0.5 con medias jornadas.</summary>
    decimal BusinessDays,
    string Status,
    string? RejectReason,
    /// <summary>Días hábiles del rango que caen dentro del mes pedido.</summary>
    decimal BusinessDaysInMonth,
    IReadOnlyList<AbsenceSquadImpactDto> SquadImpacts);

/// <summary>
/// Lo que una célula pierde por esta ausencia en el mes pedido. El FTE viaja
/// como fracción, no como porcentaje, y sin redondear: redondear cada porción
/// haría que las porciones no sumen el impacto del mes.
/// </summary>
public sealed record AbsenceSquadImpactDto(
    Guid SquadId,
    string SquadName,
    int DedicationPct,
    decimal FteImpact);
