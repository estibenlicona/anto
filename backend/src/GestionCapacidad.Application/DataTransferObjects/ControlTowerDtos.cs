namespace GestionCapacidad.Application.DataTransferObjects;

public sealed record CapacityOverviewDto(
    double ChapterFte,
    double BauFte,
    double TransformationFte,
    double FreeFte,
    int PeopleTotal,
    int PeopleUnassigned,
    int PeoplePartial,
    int SquadsAtCapacity,
    int SquadsWithoutTeam,
    IReadOnlyList<OverviewPersonDto> People,
    IReadOnlyList<OverviewSquadDto> Squads);

public sealed record OverviewPersonDto(
    Guid Id,
    string Name,
    string Position,
    string LevelLabel,
    double AvailableFte,
    OverviewAllocationDto? Allocation,
    decimal MarginPercentage);

public sealed record OverviewAllocationDto(
    Guid Id,
    Guid SquadId,
    string SquadName,
    decimal DedicationPercentage,
    decimal BauPercentage,
    decimal TransformationPercentage);

public sealed record OverviewSquadDto(
    Guid Id,
    string Name,
    string Criticality,
    int MemberCount,
    double AllocatedFte,
    double TeamAvailableFte,
    double BauFte,
    double TransformationFte);
