namespace GestionCapacidad.Application.UseCases.Companies.GetCompanyById;

public sealed record GetCompanyByIdResponse(
    Guid Id,
    string Name,
    string IdentificationNumber,
    string Email,
    bool IsActive);
