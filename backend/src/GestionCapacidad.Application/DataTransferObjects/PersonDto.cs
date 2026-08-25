namespace GestionCapacidad.Application.DataTransferObjects;

public sealed record PersonDto(
    Guid Id,
    string Name,
    string DocumentId,
    string EntraObjectId,
    string UserPrincipalName,
    string Position,
    string Role,
    int Seniority,
    string SeniorityLabel,
    string Modality,
    float AvailableFte,
    decimal MonthlyCost,
    DateOnly StartDate,
    Guid? ChapterId,
    Guid? ProviderId,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
