using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.Companies.GetCompanies;

public sealed record GetCompaniesResponse(IReadOnlyList<CompanyDto> Companies);
