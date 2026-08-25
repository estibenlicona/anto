namespace GestionCapacidad.Application.UseCases.Companies.UpdateCompany;

public sealed record UpdateCompanyRequest(
    Guid Id,
    string Name,
    string IdentificationNumber,
    string Email);
