namespace GestionCapacidad.Application.ExternalServices.CompanyRegistry;

public sealed record ExternalCompanyDto(
    string IdentificationNumber,
    string Name,
    string? Status);
