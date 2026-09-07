namespace GestionCapacidad.Application.DataTransferObjects;

/// <summary>
/// La persona como viaja en el contrato. <c>TechnicalLeadName</c>,
/// <c>TechnicalLeadOfCount</c> y <c>Utilization</c> son derivados que calcula
/// el servidor al responder — guardarlos sería poder quedar desincronizado con
/// el dato que los produce. El rol viaja como slug; su etiqueta la sirve
/// <c>GET /catalogs/roles</c>.
/// </summary>
public sealed record PersonDto(
    Guid Id,
    string Name,
    string DocumentId,
    string EntraObjectId,
    string UserPrincipalName,
    string Position,
    string Role,
    Guid? TechnicalLeadId,
    string? TechnicalLeadName,
    int TechnicalLeadOfCount,
    int Level,
    string LevelLabel,
    string Seniority,
    string SeniorityLabel,
    string Modality,
    float AvailableFte,
    decimal MonthlyCost,
    DateOnly StartDate,
    Guid? ChapterId,
    Guid? ProviderId,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    int Utilization,
    IReadOnlyCollection<PersonStackDto> Stacks);

/// <summary>Un stack de la persona: nombre del catálogo, nivel 1–4 y si es el principal.</summary>
public sealed record PersonStackDto(
    string Name,
    int Level,
    bool IsPrimary);
