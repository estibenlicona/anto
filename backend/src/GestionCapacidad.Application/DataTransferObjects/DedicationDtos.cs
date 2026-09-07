namespace GestionCapacidad.Application.DataTransferObjects;

// ── Listado ───────────────────────────────────────────────────────────────────

public sealed record CollaboratorDedicationListDto(
    IReadOnlyList<CollaboratorDedicationRowDto> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages,
    CollaboratorDedicationSummaryDto Summary,
    ListSprintDto? Sprint,
    DedicationSettingsDto Settings,
    DateTime? LastSyncedAt);

public sealed record CollaboratorDedicationRowDto(
    DedicationPersonDto Person,
    DedicationAllocationDto? Allocation,
    bool HasIdentity,
    SprintRefDto? Sprint,
    CapacityDto Capacity,
    SprintExecutionDto Execution,
    ReferenceDto Reference,
    MultitaskingDto Multitasking,
    IReadOnlyList<ConcurrentInitiativeDto> SprintInitiatives,
    BalanceSignalDto Balance);

public sealed record DedicationPersonRefDto(Guid Id, string Name);

public sealed record CollaboratorDedicationSummaryDto(
    int Total,
    int PossibleOverload,
    int PossibleUnderload,
    int Usual,
    int NotEvaluable,
    int NoIdentity,
    int NoSprint,
    int InsufficientHistory,
    IReadOnlyList<DedicationPersonRefDto> OverloadPeople,
    IReadOnlyList<DedicationPersonRefDto> UnderloadPeople);

public sealed record ListSprintDto(
    string Name, DateOnly StartDate, DateOnly EndDate, bool IsCurrent, string? PreviousName, string? NextName);

public sealed record DedicationSettingsDto(int HistoryWindowSprints, int MinHistorySprints, decimal HoursPerSprint);

// ── Detalle ───────────────────────────────────────────────────────────────────

public sealed record CollaboratorDedicationDetailDto(
    DedicationPersonDto Person,
    DedicationAllocationDto? Allocation,
    bool HasIdentity,
    DedicationSettingsDto Settings,
    DateTime? LastSyncedAt,
    IReadOnlyList<SprintTrendPointDto> Sprints,
    SelectedSprintDto? SelectedSprint);

public sealed record SprintTrendPointDto(
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    string SnapshotStatus,
    DateTime? SealedAt,
    bool IsCurrent,
    SprintExecutionDto Execution,
    SprintActivityTotalsDto Activity);

public sealed record SelectedSprintDto(
    string Name,
    DateOnly StartDate,
    DateOnly EndDate,
    string SnapshotStatus,
    DateTime? SealedAt,
    CapacityDto Capacity,
    SprintExecutionDto Execution,
    UnplannedWorkDto UnplannedWork,
    MultitaskingDto Multitasking,
    ReferenceDto Reference,
    BalanceSignalDto Balance,
    IReadOnlyList<WorkItemDto> WorkItems,
    IReadOnlyList<ActivityDayDto> Activity);

// ── Compartidos ───────────────────────────────────────────────────────────────

public sealed record DedicationPersonDto(
    Guid Id, string Name, string Position, string LevelLabel, string? AvatarUrl, decimal ContractualFte);

public sealed record DedicationActiveInitiativeDto(Guid Id, string Name, string Talla);

public sealed record DedicationAllocationDto(
    Guid Id,
    Guid SquadId,
    string SquadName,
    DedicationActiveInitiativeDto? ActiveInitiative,
    decimal DeclaredDedicationPercentage,
    decimal DeclaredBauPercentage,
    decimal DeclaredTransformationPercentage);

public sealed record SprintRefDto(string Name, DateOnly StartDate, DateOnly EndDate, string SnapshotStatus, DateTime? SealedAt);

public sealed record CapacityDto(
    decimal ContractualFte, decimal AvailableFte, CapacityBreakdownDto Breakdown, int AvailableHours, int DeductedHours);

public sealed record CapacityBreakdownDto(
    decimal BusinessDays, decimal Holidays, decimal VacationDays, decimal AbsenceDays, decimal OtherUnavailableDays);

public sealed record SprintExecutionDto(
    decimal CommittedPoints,
    decimal? CompletedPoints,
    decimal? NotCompletedPoints,
    decimal? CompletionRate,
    decimal? CarryOverPoints,
    decimal? CarryOverRate);

public sealed record ReferenceDto(
    decimal? OwnMedian,
    decimal? SquadMedian,
    int SealedSprintCount,
    bool Sufficient,
    decimal? OwnDeviationPoints,
    decimal? OwnDeviationRate,
    decimal? SquadDeviationRate);

public sealed record MultitaskingDto(
    int ConcurrentInitiatives, IReadOnlyList<ConcurrentInitiativeDto> Initiatives, int CommittedWorkItems, int? Wip);

public sealed record ConcurrentInitiativeDto(
    string EpicId, string EpicTitle, string? InitiativeId, string? InitiativeName, decimal Points);

public sealed record BalanceSignalDto(
    string Signal,
    int OverCount,
    int UnderCount,
    string SquadContext,
    string? NotEvaluableReason,
    IReadOnlyList<BalanceEvidenceDto> Evidences);

public sealed record BalanceEvidenceDto(string Id, string Direction, decimal? Value, decimal? Threshold, bool Strong);

public sealed record UnplannedWorkDto(
    decimal CommittedAtStartPoints, decimal AddedDuringSprintPoints, decimal TotalWorkedPoints, decimal UnplannedRate);

public sealed record WorkItemDto(
    string Id,
    int Number,
    string Title,
    string? Tag,
    string? EpicId,
    string? EpicTitle,
    string? InitiativeId,
    string? InitiativeName,
    decimal Points,
    string State,
    bool AddedAfterSprintStart,
    string Board,
    string Url);

public sealed record ActivityDayDto(DateOnly Date, int Commits, int Releases, int Features);

public sealed record SprintActivityTotalsDto(int Commits, int Releases, int Features);
