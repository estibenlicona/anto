using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Application.UseCases.Companies.CreateCompany;
using GestionCapacidad.Application.UseCases.Companies.GetCompanyById;
using GestionCapacidad.Application.UseCases.Companies.UpdateCompany;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class CompanyMappingsTests
{
    [Fact]
    public void ToDto_MapsCompany()
    {
        Company company = TestDataFactory.CreateCompany();

        CompanyDto dto = CompanyMappings.ToDto(company);

        Assert.Equal(company.Id, dto.Id);
        Assert.Equal(company.Name, dto.Name);
        Assert.Equal(company.IdentificationNumber, dto.IdentificationNumber);
        Assert.Equal(company.Email, dto.Email);
        Assert.Equal(company.IsActive, dto.IsActive);
    }

    [Fact]
    public void ToCreateResponse_MapsCompany()
    {
        Company company = TestDataFactory.CreateCompany();

        CreateCompanyResponse response = CompanyMappings.ToCreateResponse(company);

        Assert.Equal(company.Id, response.Id);
        Assert.Equal(company.Name, response.Name);
        Assert.Equal(company.IdentificationNumber, response.IdentificationNumber);
        Assert.Equal(company.Email, response.Email);
        Assert.Equal(company.IsActive, response.IsActive);
    }

    [Fact]
    public void ToUpdateResponse_MapsCompany()
    {
        Company company = TestDataFactory.CreateCompany();

        UpdateCompanyResponse response = CompanyMappings.ToUpdateResponse(company);

        Assert.Equal(company.Id, response.Id);
        Assert.Equal(company.Name, response.Name);
        Assert.Equal(company.IdentificationNumber, response.IdentificationNumber);
        Assert.Equal(company.Email, response.Email);
        Assert.Equal(company.IsActive, response.IsActive);
    }

    [Fact]
    public void ToGetByIdResponse_MapsCompany()
    {
        Company company = TestDataFactory.CreateCompany();

        GetCompanyByIdResponse response = CompanyMappings.ToGetByIdResponse(company);

        Assert.Equal(company.Id, response.Id);
        Assert.Equal(company.Name, response.Name);
        Assert.Equal(company.IdentificationNumber, response.IdentificationNumber);
        Assert.Equal(company.Email, response.Email);
        Assert.Equal(company.IsActive, response.IsActive);
    }
}
