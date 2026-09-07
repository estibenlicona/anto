namespace GestionCapacidad.Application.DataTransferObjects;

public sealed record ExpertiseLineDto(
    Guid Id,
    string Name,
    string Code,
    string? Description,
    string Status,
    LineLeadDto? Lead,
    int PeopleCount,
    double AvailableFte);

public sealed record ExpertiseLineDetailDto(
    Guid Id,
    string Name,
    string Code,
    string? Description,
    string Status,
    LineLeadDto? Lead,
    int PeopleCount,
    double AvailableFte,
    IReadOnlyList<LinePersonDto> People,
    LineCapacityDto Capacity);

public sealed record LineLeadDto(Guid Id, string Name);

public sealed record LinePersonDto(
    Guid Id,
    string Name,
    string Position,
    int Level,
    string LevelLabel,
    double AvailableFte,
    bool IsLead,
    LinePersonAllocationDto? Allocation);

public sealed record LinePersonAllocationDto(Guid SquadId, string SquadName, decimal DedicationPercentage);

public sealed record LineCapacityDto(
    int PeopleCount, double AvailableFte, double AllocatedFte, double FreeFte, double UnallocatedPercentage);

public sealed record RosterPersonDto(
    Guid Id, string Name, string Position, int Level, string LevelLabel, double AvailableFte, LineLeadDto? Line);

public sealed record UpsertExpertiseLineRequest(string Name, string Code, string? Description);

public sealed record SetLineLeadRequest(Guid? PersonId);

public sealed record AddLinePeopleRequest(IReadOnlyList<Guid> PersonIds);
