namespace GestionCapacidad.Application.DataTransferObjects;

/// <summary>El catálogo vigente: su versión, los cargos vigentes y las habilidades con sus niveles y expectativas.</summary>
public sealed record SkillsCatalogDto(
    int Version,
    IReadOnlyList<string> Positions,
    IReadOnlyList<SkillDto> Skills);

public sealed record SkillDto(
    Guid Id,
    string Name,
    string Group,
    string Description,
    bool Active,
    IReadOnlyList<SkillLevelDto> Levels,
    IReadOnlyList<PositionExpectationDto> Expectations);

public sealed record SkillLevelDto(int Level, IReadOnlyList<string> Criteria);

/// <summary>El nivel que un cargo exige; <c>null</c> cuando no tiene nada declarado ("sin definir").</summary>
public sealed record PositionExpectationDto(string Position, int? Level);

// ── Cuerpos de las peticiones ────────────────────────────────────────────────

public sealed record UpsertSkillRequest(string Name, string Group, string Description);

public sealed record SetSkillActiveRequest(bool Active);

public sealed record SetExpectationRequest(string Position, int? Level);

public sealed record SetCriteriaRequest(IReadOnlyList<string> Criteria);
