using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Companies.CreateCompany;
using GestionCapacidad.Application.UseCases.Companies.GetCompanyById;
using GestionCapacidad.Application.UseCases.Companies.UpdateCompany;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

public static class CompanyMappings
{
    public static CompanyDto ToDto(Company company)
    {
        return new CompanyDto(
            company.Id,
            company.Name,
            company.IdentificationNumber,
            company.Email,
            company.IsActive);
    }

    public static CreateCompanyResponse ToCreateResponse(Company company)
    {
        return new CreateCompanyResponse(
            company.Id,
            company.Name,
            company.IdentificationNumber,
            company.Email,
            company.IsActive);
    }

    public static UpdateCompanyResponse ToUpdateResponse(Company company)
    {
        return new UpdateCompanyResponse(
            company.Id,
            company.Name,
            company.IdentificationNumber,
            company.Email,
            company.IsActive);
    }

    public static GetCompanyByIdResponse ToGetByIdResponse(Company company)
    {
        return new GetCompanyByIdResponse(
            company.Id,
            company.Name,
            company.IdentificationNumber,
            company.Email,
            company.IsActive);
    }
}
