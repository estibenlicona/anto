namespace GestionCapacidad.Application.DataTransferObjects;

/// <summary>Resumen del equipo de una célula: sus asignaciones cruzadas con las personas.</summary>
public sealed record SquadTeamStatsDto(
    int MemberCount,
    IReadOnlyCollection<SquadMemberSampleDto> Members,
    int ExpertCount,
    int BeginnerCount,
    double AllocatedFte,
    double BauFte,
    double TransformationFte,
    double PeopleAvailableFte);

/// <summary>
/// Resumen agregado de células, sobre el total (sin paginar ni filtrar). Los
/// cuatro niveles de criticidad van siempre, aunque estén en cero.
/// </summary>
public sealed record SquadsStatsDto(
    int TotalCount,
    int WithoutPeopleCount,
    int AtCapacityCount,
    int TeamCount,
    double AllocatedFte,
    double BauFte,
    double TransformationFte,
    double ChapterFte,
    IReadOnlyCollection<CriticalityBucketDto> ByCriticality);

public sealed record CriticalityBucketDto(string Criticality, int Count);
