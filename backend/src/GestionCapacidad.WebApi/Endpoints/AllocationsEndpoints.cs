using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Allocations.CreateAllocation;
using GestionCapacidad.Application.UseCases.Allocations.DeleteAllocation;
using GestionCapacidad.Application.UseCases.Allocations.GetAllocationsByPerson;
using GestionCapacidad.Application.UseCases.Allocations.GetAllocationsBySquad;
using GestionCapacidad.Application.UseCases.Allocations.UpdateAllocation;
using GestionCapacidad.WebApi.Extensions;

namespace GestionCapacidad.WebApi.Endpoints;

public sealed class AllocationsEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        // By Squad
        app.MapGet("api/v{version:apiVersion}/squads/{squadId:guid}/allocations", GetBySquadAsync)
            .WithApiVersionSet(versionSet).MapToApiVersion(1, 0).WithTags("Allocations")
            .Produces<PagedResult<AllocationDto>>(StatusCodes.Status200OK);

        app.MapPost("api/v{version:apiVersion}/squads/{squadId:guid}/allocations", CreateAsync)
            .WithApiVersionSet(versionSet).MapToApiVersion(1, 0).WithTags("Allocations")
            .Produces<CreateAllocationResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        // By Person
        app.MapGet("api/v{version:apiVersion}/people/{personId:guid}/allocations", GetByPersonAsync)
            .WithApiVersionSet(versionSet).MapToApiVersion(1, 0).WithTags("Allocations")
            .Produces<IReadOnlyList<AllocationDto>>(StatusCodes.Status200OK);

        // Direct
        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/allocations")
            .WithApiVersionSet(versionSet).MapToApiVersion(1, 0).WithTags("Allocations");

        group.MapPut("/{id:guid}", UpdateAsync)
            .Produces<UpdateAllocationResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", DeleteAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetBySquadAsync(
        Guid squadId, GetAllocationsBySquadUseCase useCase, CancellationToken ct,
        int page = 1, int pageSize = 10)
    {
        (int clampedPage, int clampedPageSize) = PaginationQueryExtensions.ClampPagination(page, pageSize);
        var response = await useCase.ExecuteAsync(
            new GetAllocationsBySquadRequest(squadId, clampedPage, clampedPageSize), ct);
        return Results.Ok(response.Allocations);
    }

    private static async Task<IResult> CreateAsync(
        Guid squadId, CreateAllocationRequest request,
        CreateAllocationUseCase useCase, CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(request with { SquadId = squadId }, ct);
        return Results.Created($"api/v1/allocations/{response.Allocation.Id}", response.Allocation);
    }

    private static async Task<IResult> GetByPersonAsync(
        Guid personId, GetAllocationsByPersonUseCase useCase, CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(personId, ct);
        return Results.Ok(response.Allocations);
    }

    private static async Task<IResult> UpdateAsync(
        Guid id, UpdateAllocationRequest request,
        UpdateAllocationUseCase useCase, CancellationToken ct)
    {
        var response = await useCase.ExecuteAsync(request with { Id = id }, ct);
        return Results.Ok(response.Allocation);
    }

    private static async Task<IResult> DeleteAsync(
        Guid id, DeleteAllocationUseCase useCase, CancellationToken ct)
    {
        await useCase.ExecuteAsync(new DeleteAllocationRequest(id), ct);
        return Results.NoContent();
    }
}
