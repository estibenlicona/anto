namespace GestionCapacidad.Application.DataTransferObjects;

// ── Span ──────────────────────────────────────────────────────────────────────

public sealed record SpanMatrixDto(IReadOnlyList<SpanSkillDto> Skills, IReadOnlyList<SpanPersonDto> People);

public sealed record SpanSkillDto(Guid SkillId, string SkillName, string Group);

public sealed record SpanPersonDto(
    Guid PersonId, string PersonName, string Position, bool Evaluated, IReadOnlyList<SpanCellDto> Cells);

public sealed record SpanCellDto(Guid SkillId, int? Level, int? ExpectedLevel, decimal? Gap);

public sealed record SpanSummaryDto(
    int TotalGaps,
    int CriticalGaps,
    int EvaluatedPeople,
    int TotalPeople,
    IReadOnlyList<SpanPersonRefDto> PeopleAtRisk,
    SpanCyclePointDto? PreviousCycle,
    IReadOnlyList<SpanCyclePointDto> Trend,
    IReadOnlyList<SpanFocusSkillDto> TopSkills,
    SpanPendingDto Pending);

public sealed record SpanPersonRefDto(Guid PersonId, string PersonName, int GapCount);

public sealed record SpanCyclePointDto(string Cycle, int TotalGaps);

public sealed record SpanFocusSkillDto(Guid SkillId, string SkillName, decimal Weight, int PeopleWithGap, int? ExpectedLevel);

public sealed record SpanPendingDto(int Unassessed, int OverduePlans, int PositionsWithoutLevel, int GapsWithoutPlan);

// ── Perfil y plan ─────────────────────────────────────────────────────────────

public sealed record PersonPlanDto(
    Guid PersonId,
    string PersonName,
    string Position,
    DateTime? AssessmentClosedAtUtc,
    string? Cycle,
    IReadOnlyList<PlanSkillDto> Skills,
    IReadOnlyList<PlanActionDto> Actions);

public sealed record PlanSkillDto(
    Guid SkillId,
    string SkillName,
    string Group,
    int Level,
    int? ExpectedLevel,
    decimal? Gap,
    IReadOnlyList<string> MetCriteria,
    int LevelTotal,
    IReadOnlyList<string> MissingCriteria,
    int ExpectedTotal,
    string Note);

public sealed record PlanActionDto(
    Guid Id,
    Guid PersonId,
    Guid SkillId,
    string SkillName,
    int FromLevel,
    int TargetLevel,
    string DueMonth,
    string Title,
    string Status);

// ── Requests ──────────────────────────────────────────────────────────────────

public sealed record CreatePlanActionRequest(Guid SkillId, int TargetLevel, string DueMonth, string Title);

public sealed record SetPlanActionStatusRequest(string Status);
