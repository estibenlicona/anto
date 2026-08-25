namespace GestionCapacidad.Application.UseCases.Companies.UpdateCompany;

public sealed record UpdateCompanyResponse(
    Guid Id,
    string Name,
    string IdentificationNumber,
    string Email,
    bool IsActive);
