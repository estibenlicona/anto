namespace GestionCapacidad.Application.DataTransferObjects;

public sealed record InitiativeDto(
    Guid Id,
    Guid SquadId,
    string Name,
    string Type,
    string Status,
    int DeadlineMonths,
    bool BacklogDefined,
    bool ArchitectureDefined,
    bool EarlyStageCompleted,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
