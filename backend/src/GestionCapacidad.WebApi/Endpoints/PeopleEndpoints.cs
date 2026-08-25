using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.WebApi.Extensions;
using GestionCapacidad.Application.UseCases.People.AssignPersonToChapter;
using GestionCapacidad.Application.UseCases.People.AssignPersonToProvider;
using GestionCapacidad.Application.UseCases.People.CreatePerson;
using GestionCapacidad.Application.UseCases.People.DeletePerson;
using GestionCapacidad.Application.UseCases.People.GetPeople;
using GestionCapacidad.Application.UseCases.People.GetPersonById;
using GestionCapacidad.Application.UseCases.People.RemovePersonFromChapter;
using GestionCapacidad.Application.UseCases.People.UpdatePerson;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Endpoints;

public sealed class PeopleEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/people")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("People");

        // CRUD
        group.MapGet("/", GetAllAsync)
            .Produces<PagedResult<PersonDto>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", GetByIdAsync)
            .WithName("GetPersonById")
            .Produces<PersonDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", CreateAsync)
            .Produces<CreatePersonResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", UpdateAsync)
            .Produces<UpdatePersonResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", DeleteAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        // Chapter assignment
        group.MapPut("/{id:guid}/chapter/{chapterId:guid}", AssignToChapterAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}/chapter", RemoveFromChapterAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        // Provider assignment
        group.MapPut("/{id:guid}/provider/{providerId:guid}", AssignToProviderAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        // Catalogs
        RouteGroupBuilder catalogGroup = app
            .MapGroup("api/v{version:apiVersion}/catalogs")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Catalogs");

        catalogGroup.MapGet("/seniorities", GetSenioritiesAsync)
            .Produces<IReadOnlyCollection<object>>(StatusCodes.Status200OK);

        catalogGroup.MapGet("/modalities", () => Results.Ok(Modality.ValidValues))
            .Produces<IReadOnlyCollection<string>>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> GetAllAsync(
        GetPeopleUseCase useCase,
        CancellationToken ct,
        int page = 1,
        int pageSize = 10,
        string? search = null,
        int[]? seniority = null)
    {
        (int clampedPage, int clampedPageSize) = PaginationQueryExtensions.ClampPagination(page, pageSize);
        GetPeopleResponse response = await useCase.ExecuteAsync(
            new GetPeopleRequest(clampedPage, clampedPageSize, search, seniority), ct);
        return Results.Ok(response.People);
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id, GetPersonByIdUseCase useCase, CancellationToken ct)
    {
        GetPersonByIdResponse response = await useCase.ExecuteAsync(new GetPersonByIdRequest(id), ct);
        return Results.Ok(response.Person);
    }

    private static async Task<IResult> CreateAsync(
        CreatePersonRequest request, CreatePersonUseCase useCase, CancellationToken ct)
    {
        CreatePersonResponse response = await useCase.ExecuteAsync(request, ct);
        return Results.CreatedAtRoute("GetPersonById", new { id = response.Person.Id }, response.Person);
    }

    private static async Task<IResult> UpdateAsync(
        Guid id, UpdatePersonRequest request, UpdatePersonUseCase useCase, CancellationToken ct)
    {
        UpdatePersonResponse response = await useCase.ExecuteAsync(request with { Id = id }, ct);
        return Results.Ok(response.Person);
    }

    private static async Task<IResult> DeleteAsync(
        Guid id, DeletePersonUseCase useCase, CancellationToken ct)
    {
        await useCase.ExecuteAsync(new DeletePersonRequest(id), ct);
        return Results.NoContent();
    }

    private static async Task<IResult> AssignToChapterAsync(
        Guid id, Guid chapterId, AssignPersonToChapterUseCase useCase, CancellationToken ct)
    {
        await useCase.ExecuteAsync(new AssignPersonToChapterRequest(id, chapterId), ct);
        return Results.NoContent();
    }

    private static async Task<IResult> RemoveFromChapterAsync(
        Guid id, RemovePersonFromChapterUseCase useCase, CancellationToken ct)
    {
        await useCase.ExecuteAsync(new RemovePersonFromChapterRequest(id), ct);
        return Results.NoContent();
    }

    private static async Task<IResult> AssignToProviderAsync(
        Guid id, Guid providerId, AssignPersonToProviderUseCase useCase, CancellationToken ct)
    {
        await useCase.ExecuteAsync(new AssignPersonToProviderRequest(id, providerId), ct);
        return Results.NoContent();
    }

    private static IResult GetSenioritiesAsync() =>
        Results.Ok(Enumerable.Range(Seniority.Min, Seniority.Max)
            .Select(Seniority.From)
            .Select(s => new { value = s.Value, label = s.Label }));
}
