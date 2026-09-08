namespace GestionCapacidad.Application.DataTransferObjects;

public sealed record PersonDetailDto(
    PersonDto Person,
    string? ProviderName,
    DateOnly? ContractEndsAt,
    string? ChapterName,
    string? ChapterLeadName,
    string? ExpertiseLineName,
    string? ExpertiseLineLeadName,
    PersonDetailAllocationDto? Allocation,
    DevOpsIdentityDto? DevOpsIdentity,
    IReadOnlyList<PersonStackDetailDto> Stacks,
    string CostReading,
    IReadOnlyList<SuggestedSquadDto> SuggestedSquads);

public sealed record PersonDetailAllocationDto(
    Guid Id,
    Guid SquadId,
    string SquadName,
    string SquadCriticality,
    string SquadTeamName,
    string SquadDescription,
    IReadOnlyList<string> Teammates,
    decimal DedicationPercentage,
    decimal BauPercentage,
    decimal TransformationPercentage,
    DateOnly Since,
    int RequiredLevel);

public sealed record DevOpsIdentityDto(string Id, string UserName, DateOnly LinkedAt, CurrentSprintBalanceDto? CurrentSprint);

public sealed record CurrentSprintBalanceDto(
    SprintRefDto Sprint,
    decimal CommittedPoints,
    decimal? OwnMedianPoints,
    decimal? OwnDeviationRate,
    CapacityDto Capacity,
    string Signal,
    string? NotEvaluableReason,
    int EvidenceCount);

public sealed record PersonStackDetailDto(
    string Name, int Level, bool IsPrimary, int OtherCoverers, IReadOnlyList<PersonRefDto> Coverers);

public sealed record SuggestedSquadDto(
    Guid Id,
    string Name,
    string Criticality,
    string Reason,
    int RequiredLevel,
    double AllocatedFte,
    double TeamAvailableFte);

public sealed record LinkDevOpsIdentityRequest(string IdentityId);
