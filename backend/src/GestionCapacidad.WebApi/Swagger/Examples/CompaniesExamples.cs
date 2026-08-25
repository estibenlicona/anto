using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Companies.CreateCompany;
using GestionCapacidad.Application.UseCases.Companies.GetCompanyById;
using GestionCapacidad.Application.UseCases.Companies.UpdateCompany;
using GestionCapacidad.Application.UseCases.CompanyRegistry.GetExternalCompany;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

public sealed class CompanyDtoExample : IExamplesProvider<CompanyDto>
{
    public CompanyDto GetExamples() => new(
        Id: Guid.Parse("44444444-4444-4444-4444-444444444444"),
        Name: "Proveedor Tecnológico S.A.S.",
        IdentificationNumber: "900123456-7",
        Email: "contacto@proveedortecnologico.com",
        IsActive: true);
}

public sealed class CreateCompanyRequestExample : IExamplesProvider<CreateCompanyRequest>
{
    public CreateCompanyRequest GetExamples() => new(
        Name: "Proveedor Tecnológico S.A.S.",
        IdentificationNumber: "900123456-7",
        Email: "contacto@proveedortecnologico.com");
}

public sealed class CreateCompanyResponseExample : IExamplesProvider<CreateCompanyResponse>
{
    public CreateCompanyResponse GetExamples() => new(
        Id: Guid.Parse("44444444-4444-4444-4444-444444444444"),
        Name: "Proveedor Tecnológico S.A.S.",
        IdentificationNumber: "900123456-7",
        Email: "contacto@proveedortecnologico.com",
        IsActive: true);
}

public sealed class GetCompanyByIdResponseExample : IExamplesProvider<GetCompanyByIdResponse>
{
    public GetCompanyByIdResponse GetExamples() => new(
        Id: Guid.Parse("44444444-4444-4444-4444-444444444444"),
        Name: "Proveedor Tecnológico S.A.S.",
        IdentificationNumber: "900123456-7",
        Email: "contacto@proveedortecnologico.com",
        IsActive: true);
}

public sealed class UpdateCompanyRequestExample : IExamplesProvider<UpdateCompanyRequest>
{
    public UpdateCompanyRequest GetExamples() => new(
        Id: Guid.Parse("44444444-4444-4444-4444-444444444444"),
        Name: "Proveedor Tecnológico S.A.S.",
        IdentificationNumber: "900123456-7",
        Email: "facturacion@proveedortecnologico.com");
}

public sealed class UpdateCompanyResponseExample : IExamplesProvider<UpdateCompanyResponse>
{
    public UpdateCompanyResponse GetExamples() => new(
        Id: Guid.Parse("44444444-4444-4444-4444-444444444444"),
        Name: "Proveedor Tecnológico S.A.S.",
        IdentificationNumber: "900123456-7",
        Email: "facturacion@proveedortecnologico.com",
        IsActive: true);
}

public sealed class GetExternalCompanyResponseExample : IExamplesProvider<GetExternalCompanyResponse>
{
    public GetExternalCompanyResponse GetExamples() => new(
        IdentificationNumber: "900123456-7",
        Name: "Proveedor Tecnológico S.A.S.",
        Status: "ACTIVE");
}
