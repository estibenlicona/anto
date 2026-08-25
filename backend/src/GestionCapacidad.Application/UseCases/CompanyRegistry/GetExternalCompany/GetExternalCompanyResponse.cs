namespace GestionCapacidad.Application.UseCases.CompanyRegistry.GetExternalCompany;

public sealed record GetExternalCompanyResponse(
    string IdentificationNumber,
    string Name,
    string? Status);
