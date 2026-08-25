namespace GestionCapacidad.Application.UseCases.People.UpdatePerson;

public sealed record UpdatePersonRequest(
    Guid Id,
    string Name,
    string DocumentId,
    string EntraObjectId,
    string UserPrincipalName,
    string Position,
    string Role,
    int Seniority,
    string Modality,
    float AvailableFte,
    decimal MonthlyCost);
