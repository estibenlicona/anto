namespace GestionCapacidad.Application.UseCases.Companies.CreateCompany;

public sealed record CreateCompanyResponse(
    Guid Id,
    string Name,
    string IdentificationNumber,
    string Email,
    bool IsActive);
