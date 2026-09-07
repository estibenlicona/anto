namespace GestionCapacidad.Application.DataTransferObjects;

/// <summary>
/// La asignación como viaja en el contrato. Los campos de persona
/// (cargo, modalidad, nivel y margen) se derivan del maestro al responder:
/// guardarlos sería poder quedar desincronizados con la persona.
/// <c>PersonAvailablePercentage</c> = 100 − dedicación (nunca negativo):
/// con la regla de asignación única es el margen real de la persona.
/// </summary>
public sealed record AllocationDto(
    Guid Id,
    Guid PersonId,
    string PersonName,
    Guid SquadId,
    string SquadName,
    Guid? InitiativeId,
    string? InitiativeName,
    int DedicationPercentage,
    int BauPercentage,
    int TransformationPercentage,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    string PersonPosition,
    string PersonModality,
    int PersonLevel,
    string PersonLevelLabel,
    int PersonAvailablePercentage);
