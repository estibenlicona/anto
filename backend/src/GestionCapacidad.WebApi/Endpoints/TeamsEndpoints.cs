using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Teams.CreateTeam;
using GestionCapacidad.Application.UseCases.Teams.DeleteTeam;
using GestionCapacidad.Application.UseCases.Teams.GetTeamById;
using GestionCapacidad.Application.UseCases.Teams.GetTeams;
using GestionCapacidad.Application.UseCases.Teams.UpdateTeam;
using GestionCapacidad.WebApi.Extensions;

namespace GestionCapacidad.WebApi.Endpoints;

public sealed class TeamsEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/teams")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Teams");

        group.MapGet("/", GetAllAsync)
            .Produces<PagedResult<TeamDto>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", GetByIdAsync)
            .WithName("GetTeamById")
            .Produces<TeamDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", CreateAsync)
            .Produces<TeamDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", UpdateAsync)
            .Produces<TeamDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", DeleteAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status409Conflict);
    }

    private static async Task<IResult> GetAllAsync(
        GetTeamsUseCase getTeamsUseCase,
        CancellationToken cancellationToken,
        int page = 1,
        int pageSize = 10,
        string? search = null)
    {
        (int clampedPage, int clampedPageSize) = PaginationQueryExtensions.ClampPagination(page, pageSize);
        GetTeamsResponse response = await getTeamsUseCase.ExecuteAsync(
            new GetTeamsRequest(clampedPage, clampedPageSize, search), cancellationToken);
        return Results.Ok(response.Teams);
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        GetTeamByIdUseCase getTeamByIdUseCase,
        CancellationToken cancellationToken)
    {
        GetTeamByIdResponse response = await getTeamByIdUseCase.ExecuteAsync(
            new GetTeamByIdRequest(id),
            cancellationToken);

        return Results.Ok(response.Team);
    }

    private static async Task<IResult> CreateAsync(
        CreateTeamRequest request,
        CreateTeamUseCase createTeamUseCase,
        CancellationToken cancellationToken)
    {
        CreateTeamResponse response = await createTeamUseCase.ExecuteAsync(request, cancellationToken);
        return Results.CreatedAtRoute("GetTeamById", new { id = response.Team.Id }, response.Team);
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateTeamRequest request,
        UpdateTeamUseCase updateTeamUseCase,
        CancellationToken cancellationToken)
    {
        UpdateTeamResponse response = await updateTeamUseCase.ExecuteAsync(
            request with { Id = id },
            cancellationToken);

        return Results.Ok(response.Team);
    }

    private static async Task<IResult> DeleteAsync(
        Guid id,
        DeleteTeamUseCase deleteTeamUseCase,
        CancellationToken cancellationToken)
    {
        await deleteTeamUseCase.ExecuteAsync(new DeleteTeamRequest(id), cancellationToken);
        return Results.NoContent();
    }
}
