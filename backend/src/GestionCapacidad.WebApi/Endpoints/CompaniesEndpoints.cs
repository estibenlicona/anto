using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Companies.CreateCompany;
using GestionCapacidad.Application.UseCases.Companies.DeleteCompany;
using GestionCapacidad.Application.UseCases.Companies.GetCompanies;
using GestionCapacidad.Application.UseCases.Companies.GetCompanyById;
using GestionCapacidad.Application.UseCases.Companies.UpdateCompany;

namespace GestionCapacidad.WebApi.Endpoints;

public sealed class CompaniesEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/companies")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Companies");

        group.MapGet("/", GetAllAsync)
            .Produces<IReadOnlyList<CompanyDto>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", GetByIdAsync)
            .WithName("GetCompanyById")
            .Produces<GetCompanyByIdResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", CreateAsync)
            .Produces<CreateCompanyResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", UpdateAsync)
            .Produces<UpdateCompanyResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", DeleteAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetAllAsync(
        GetCompaniesUseCase getCompaniesUseCase,
        CancellationToken cancellationToken)
    {
        GetCompaniesResponse response = await getCompaniesUseCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Companies);
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        GetCompanyByIdUseCase getCompanyByIdUseCase,
        CancellationToken cancellationToken)
    {
        GetCompanyByIdResponse response = await getCompanyByIdUseCase.ExecuteAsync(
            new GetCompanyByIdRequest(id),
            cancellationToken);

        return Results.Ok(response);
    }

    private static async Task<IResult> CreateAsync(
        CreateCompanyRequest request,
        CreateCompanyUseCase createCompanyUseCase,
        CancellationToken cancellationToken)
    {
        CreateCompanyResponse response = await createCompanyUseCase.ExecuteAsync(request, cancellationToken);
        return Results.CreatedAtRoute("GetCompanyById", new { id = response.Id }, response);
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateCompanyRequest request,
        UpdateCompanyUseCase updateCompanyUseCase,
        CancellationToken cancellationToken)
    {
        UpdateCompanyResponse response = await updateCompanyUseCase.ExecuteAsync(
            request with { Id = id },
            cancellationToken);

        return Results.Ok(response);
    }

    private static async Task<IResult> DeleteAsync(
        Guid id,
        DeleteCompanyUseCase deleteCompanyUseCase,
        CancellationToken cancellationToken)
    {
        await deleteCompanyUseCase.ExecuteAsync(new DeleteCompanyRequest(id), cancellationToken);
        return Results.NoContent();
    }
}
