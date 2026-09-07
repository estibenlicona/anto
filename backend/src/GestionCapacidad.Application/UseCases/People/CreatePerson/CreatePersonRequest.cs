namespace GestionCapacidad.Application.UseCases.People.CreatePerson;

public sealed record CreatePersonRequest(
    string Name,
    string DocumentId,
    string EntraObjectId,
    string UserPrincipalName,
    string Position,
    string Role,
    Guid? TechnicalLeadId,
    int Level,
    string Seniority,
    string Modality,
    float AvailableFte,
    decimal MonthlyCost,
    DateOnly StartDate);
