using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Squads.CreateSquad;
using GestionCapacidad.Application.UseCases.Squads.DeleteSquad;
using GestionCapacidad.Application.UseCases.Squads.GetSquadById;
using GestionCapacidad.Application.UseCases.Squads.GetSquads;
using GestionCapacidad.Application.UseCases.Squads.GetSquadsStats;
using GestionCapacidad.Application.UseCases.Squads.GetSquadTeamStats;
using GestionCapacidad.Application.UseCases.Squads.UpdateSquad;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.WebApi.Extensions;

namespace GestionCapacidad.WebApi.Endpoints;

public sealed class SquadsEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/squads")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Squads");

        group.MapGet("/", GetAllAsync)
            .Produces<PagedResult<SquadDto>>(StatusCodes.Status200OK);

        // Rutas literales antes de /{id:guid}; el constraint evita el choque
        // igualmente, como en People.
        group.MapGet("/stats", GetStatsAsync)
            .Produces<SquadsStatsDto>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}/team-stats", GetTeamStatsAsync)
            .Produces<SquadTeamStatsDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/{id:guid}", GetByIdAsync)
            .WithName("GetSquadById")
            .Produces<SquadDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", CreateAsync)
            .Produces<SquadDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", UpdateAsync)
            .Produces<SquadDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", DeleteAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        // Catálogo de criticidades para el frontend
        app.MapGet("api/v{version:apiVersion}/criticalities", GetCriticalitiesAsync)
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Catalogs")
            .Produces<IReadOnlyCollection<string>>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> GetAllAsync(
        GetSquadsUseCase getSquadsUseCase,
        CancellationToken cancellationToken,
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string[]? criticality = null,
        Guid[]? teamId = null)
    {
        (int clampedPage, int clampedPageSize) = PaginationQueryExtensions.ClampPagination(page, pageSize);
        GetSquadsResponse response = await getSquadsUseCase.ExecuteAsync(
            new GetSquadsRequest(clampedPage, clampedPageSize, search, criticality, teamId), cancellationToken);
        return Results.Ok(response.Squads);
    }

    private static async Task<IResult> GetStatsAsync(
        GetSquadsStatsUseCase useCase, CancellationToken ct)
    {
        GetSquadsStatsResponse response = await useCase.ExecuteAsync(ct);
        return Results.Ok(response.Stats);
    }

    private static async Task<IResult> GetTeamStatsAsync(
        Guid id, GetSquadTeamStatsUseCase useCase, CancellationToken ct)
    {
        GetSquadTeamStatsResponse response = await useCase.ExecuteAsync(new GetSquadTeamStatsRequest(id), ct);
        return Results.Ok(response.Stats);
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        GetSquadByIdUseCase getSquadByIdUseCase,
        CancellationToken cancellationToken)
    {
        GetSquadByIdResponse response = await getSquadByIdUseCase.ExecuteAsync(
            new GetSquadByIdRequest(id),
            cancellationToken);

        return Results.Ok(response.Squad);
    }

    private static async Task<IResult> CreateAsync(
        CreateSquadRequest request,
        CreateSquadUseCase createSquadUseCase,
        CancellationToken cancellationToken)
    {
        CreateSquadResponse response = await createSquadUseCase.ExecuteAsync(request, cancellationToken);
        return Results.CreatedAtRoute("GetSquadById", new { id = response.Squad.Id }, response.Squad);
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateSquadRequest request,
        UpdateSquadUseCase updateSquadUseCase,
        CancellationToken cancellationToken)
    {
        UpdateSquadResponse response = await updateSquadUseCase.ExecuteAsync(
            request with { Id = id },
            cancellationToken);

        return Results.Ok(response.Squad);
    }

    private static async Task<IResult> DeleteAsync(
        Guid id,
        DeleteSquadUseCase deleteSquadUseCase,
        CancellationToken cancellationToken)
    {
        await deleteSquadUseCase.ExecuteAsync(new DeleteSquadRequest(id), cancellationToken);
        return Results.NoContent();
    }

    private static IResult GetCriticalitiesAsync() =>
        Results.Ok(Criticality.ValidValues);
}
