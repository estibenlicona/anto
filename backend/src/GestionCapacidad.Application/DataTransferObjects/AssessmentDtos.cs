namespace GestionCapacidad.Application.DataTransferObjects;

public sealed record AssessmentDto(
    Guid Id,
    Guid PersonId,
    string PersonName,
    string Position,
    string Cycle,
    string Status,
    int CatalogVersion,
    DateTime? ClosedAtUtc,
    IReadOnlyList<AssessmentSkillDto> Skills);

public sealed record AssessmentSkillDto(
    Guid SkillId,
    string SkillName,
    string Group,
    int? Level,
    string Note,
    IReadOnlyList<AssessmentLevelDto> Levels,
    int? ExpectedLevel,
    decimal? Gap,
    IReadOnlyList<string> MissingCriteria);

public sealed record AssessmentLevelDto(int Level, IReadOnlyList<AssessmentCriterionDto> Criteria);

public sealed record AssessmentCriterionDto(string Text, bool Met);

// ── Cuerpo de la petición ────────────────────────────────────────────────────

public sealed record SaveSkillRequest(int Level, IReadOnlyList<IReadOnlyList<string>> Met, string Note);
