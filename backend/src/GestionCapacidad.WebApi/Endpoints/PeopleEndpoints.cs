using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.WebApi.Extensions;
using GestionCapacidad.Application.UseCases.People.AssignPersonToChapter;
using GestionCapacidad.Application.UseCases.People.AssignPersonToProvider;
using GestionCapacidad.Application.UseCases.People.CreatePerson;
using GestionCapacidad.Application.UseCases.People.DeletePerson;
using GestionCapacidad.Application.UseCases.People.GetPeople;
using GestionCapacidad.Application.UseCases.People.GetPeopleStats;
using GestionCapacidad.Application.UseCases.People.GetPersonById;
using GestionCapacidad.Application.UseCases.People.GetPersonExpertiseLine;
using GestionCapacidad.Application.UseCases.People.GetTechnicalLeads;
using GestionCapacidad.Application.UseCases.People.ReplacePersonStacks;
using GestionCapacidad.Application.UseCases.People.RemovePersonFromChapter;
using GestionCapacidad.Application.UseCases.People.UpdatePerson;
using GestionCapacidad.Application.Abstractions;
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

        // Derivados y sub-recursos del contrato. Las rutas literales van
        // antes que /{id:guid}; el constraint evita el choque igualmente.
        group.MapGet("/stats", GetStatsAsync)
            .Produces<PeopleStatsDto>(StatusCodes.Status200OK);

        group.MapGet("/stacks", GetStackCatalogAsync)
            .Produces<IReadOnlyCollection<string>>(StatusCodes.Status200OK);

        group.MapGet("/technical-leads", GetTechnicalLeadsAsync)
            .Produces<IReadOnlyCollection<PersonRefDto>>(StatusCodes.Status200OK);

        group.MapPut("/{id:guid}/stacks", ReplaceStacksAsync)
            .Produces<PersonDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/{id:guid}/expertise-line", GetExpertiseLineAsync)
            .Produces<PersonExpertiseLineDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

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

        catalogGroup.MapGet("/levels", GetLevelsAsync)
            .Produces<IReadOnlyCollection<object>>(StatusCodes.Status200OK);

        catalogGroup.MapGet("/seniorities", GetSenioritiesAsync)
            .Produces<IReadOnlyCollection<object>>(StatusCodes.Status200OK);

        catalogGroup.MapGet("/modalities", () => Results.Ok(Modality.ValidValues))
            .Produces<IReadOnlyCollection<string>>(StatusCodes.Status200OK);

        catalogGroup.MapGet("/roles", GetRolesAsync)
            .Produces<IReadOnlyCollection<object>>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> GetAllAsync(
        GetPeopleUseCase useCase,
        CancellationToken ct,
        int page = 1,
        int pageSize = 10,
        string? search = null,
        int[]? level = null,
        string[]? seniority = null,
        string[]? stack = null)
    {
        (int clampedPage, int clampedPageSize) = PaginationQueryExtensions.ClampPagination(page, pageSize);
        GetPeopleResponse response = await useCase.ExecuteAsync(
            new GetPeopleRequest(clampedPage, clampedPageSize, search, level, seniority, stack), ct);
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

    private static async Task<IResult> GetStatsAsync(
        GetPeopleStatsUseCase useCase, CancellationToken ct)
    {
        GetPeopleStatsResponse response = await useCase.ExecuteAsync(ct);
        return Results.Ok(response.Stats);
    }

    private static IResult GetStackCatalogAsync(IStackCatalog stackCatalog) =>
        Results.Ok(stackCatalog.Names);

    private static async Task<IResult> GetTechnicalLeadsAsync(
        GetTechnicalLeadsUseCase useCase, CancellationToken ct)
    {
        GetTechnicalLeadsResponse response = await useCase.ExecuteAsync(ct);
        return Results.Ok(response.Leads);
    }

    private static async Task<IResult> ReplaceStacksAsync(
        Guid id, ReplacePersonStacksRequest request, ReplacePersonStacksUseCase useCase, CancellationToken ct)
    {
        ReplacePersonStacksResponse response = await useCase.ExecuteAsync(request with { PersonId = id }, ct);
        return Results.Ok(response.Person);
    }

    private static async Task<IResult> GetExpertiseLineAsync(
        Guid id, GetPersonExpertiseLineUseCase useCase, CancellationToken cancellationToken)
    {
        GetPersonExpertiseLineResponse response = await useCase.ExecuteAsync(
            new GetPersonExpertiseLineRequest(id), cancellationToken);
        return Results.Ok(response.ExpertiseLine);
    }

    private static IResult GetRolesAsync() =>
        Results.Ok(PersonRole.ValidValues
            .Select(r => new { value = r.Value, label = r.Label }));

    private static IResult GetSenioritiesAsync() =>
        Results.Ok(Seniority.ValidValues
            .Select(s => new { value = s.Value, label = s.Label }));

    private static IResult GetLevelsAsync() =>
        Results.Ok(Enumerable.Range(Level.Min, Level.Max)
            .Select(Level.From)
            .Select(s => new { value = s.Value, label = s.Label }));
}
