namespace GestionCapacidad.Application.DataTransferObjects;

public sealed record BauTaskDto(Guid Id, Guid SquadId, string Name, DateTime CreatedAtUtc, DateTime? UpdatedAtUtc);
