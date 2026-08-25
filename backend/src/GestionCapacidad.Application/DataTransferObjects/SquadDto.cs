namespace GestionCapacidad.Application.DataTransferObjects;

public sealed record SquadDto(
    Guid Id,
    string Name,
    string Criticality,
    string Tribe,
    string? Description,
    Guid? DevOpsBoardId,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
