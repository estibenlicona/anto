namespace GestionCapacidad.Application.DataTransferObjects;

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
    DateTime? UpdatedAtUtc);
