namespace GestionCapacidad.Application.DataTransferObjects;

/// <summary>
/// La célula como viaja en el contrato. Los agregados (equipo, FTEs e
/// iniciativa activa) los calcula el servidor desde las asignaciones e
/// iniciativas vigentes al responder — son de sólo lectura, guardarlos sería
/// poder quedar desincronizados. <c>UpdatedAtUtc</c> nunca es nulo: si la
/// célula no se ha editado, responde su fecha de creación.
/// </summary>
public sealed record SquadDto(
    Guid Id,
    string Name,
    string Team,
    string Criticality,
    string? Description,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc,
    int MemberCount,
    IReadOnlyCollection<SquadMemberSampleDto> Members,
    double AllocatedFte,
    double BauFte,
    double TransformationFte,
    double PeopleAvailableFte,
    SquadActiveInitiativeDto? ActiveInitiative);

public sealed record SquadMemberSampleDto(Guid Id, string Name);

/// <summary>
/// La iniciativa Activa de la célula (una o ninguna). La talla sale de la
/// evaluación, que llega con el módulo de iniciativas: hasta entonces viaja
/// vacía.
/// </summary>
public sealed record SquadActiveInitiativeDto(Guid Id, string Name, string Talla);
