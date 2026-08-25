namespace GestionCapacidad.Application.UseCases.Companies.CreateCompany;

public sealed record CreateCompanyRequest(
    string Name,
    string IdentificationNumber,
    string Email);
