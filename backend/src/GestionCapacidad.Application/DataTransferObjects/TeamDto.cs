namespace GestionCapacidad.Application.DataTransferObjects;

/// <summary>
/// <c>SquadCount</c> es calculado contra las células que referencian el
/// equipo — nunca se envía en alta/edición. <c>UpdatedAtUtc</c> nunca es
/// nulo: si el equipo no se ha editado, responde su fecha de creación.
/// </summary>
public sealed record TeamDto(
    Guid Id,
    string Name,
    string? Description,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc,
    int SquadCount);
