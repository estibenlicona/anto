namespace GestionCapacidad.Application.DataTransferObjects;

public sealed record CompanyDto(
    Guid Id,
    string Name,
    string IdentificationNumber,
    string Email,
    bool IsActive);
