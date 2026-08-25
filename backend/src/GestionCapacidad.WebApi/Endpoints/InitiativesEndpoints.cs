using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Initiatives.ChangeInitiativeStatus;
using GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;
using GestionCapacidad.Application.UseCases.Initiatives.DeleteInitiative;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiativeById;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiatives;
using GestionCapacidad.Application.UseCases.Initiatives.UpdateInitiative;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Endpoints;

public sealed class InitiativesEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder squadGroup = app
            .MapGroup("api/v{version:apiVersion}/squads/{squadId:guid}/initiatives")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Initiatives");

        squadGroup.MapGet("/", GetBySquadAsync)
            .Produces<IReadOnlyList<InitiativeDto>>(StatusCodes.Status200OK);

        squadGroup.MapPost("/", CreateAsync)
            .Produces<CreateInitiativeResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        // Direct access by id
        RouteGroupBuilder directGroup = app
            .MapGroup("api/v{version:apiVersion}/initiatives")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Initiatives");

        directGroup.MapGet("/{id:guid}", GetByIdAsync)
            .WithName("GetInitiativeById")
            .Produces<InitiativeDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        directGroup.MapPut("/{id:guid}", UpdateAsync)
            .Produces<UpdateInitiativeResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        directGroup.MapPut("/{id:guid}/status", ChangeStatusAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        directGroup.MapDelete("/{id:guid}", DeleteAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        // Catalogs
        app.MapGet("api/v{version:apiVersion}/catalogs/initiative-types",
            () => Results.Ok(InitiativeType.ValidValues))
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Catalogs")
            .Produces<IReadOnlyCollection<string>>(StatusCodes.Status200OK);

        app.MapGet("api/v{version:apiVersion}/catalogs/initiative-statuses",
            () => Results.Ok(InitiativeStatus.ValidValues))
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Catalogs")
            .Produces<IReadOnlyCollection<string>>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> GetBySquadAsync(
        Guid squadId, GetInitiativesUseCase useCase, CancellationToken ct)
    {
        GetInitiativesResponse response = await useCase.ExecuteAsync(squadId, ct);
        return Results.Ok(response.Initiatives);
    }

    private static async Task<IResult> CreateAsync(
        Guid squadId, CreateInitiativeRequest request,
        CreateInitiativeUseCase useCase, CancellationToken ct)
    {
        CreateInitiativeResponse response = await useCase.ExecuteAsync(
            request with { SquadId = squadId }, ct);
        return Results.CreatedAtRoute("GetInitiativeById", new { id = response.Initiative.Id }, response.Initiative);
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id, GetInitiativeByIdUseCase useCase, CancellationToken ct)
    {
        GetInitiativeByIdResponse response = await useCase.ExecuteAsync(new GetInitiativeByIdRequest(id), ct);
        return Results.Ok(response.Initiative);
    }

    private static async Task<IResult> UpdateAsync(
        Guid id, UpdateInitiativeRequest request,
        UpdateInitiativeUseCase useCase, CancellationToken ct)
    {
        UpdateInitiativeResponse response = await useCase.ExecuteAsync(request with { Id = id }, ct);
        return Results.Ok(response.Initiative);
    }

    private static async Task<IResult> ChangeStatusAsync(
        Guid id, ChangeInitiativeStatusRequest request,
        ChangeInitiativeStatusUseCase useCase, CancellationToken ct)
    {
        await useCase.ExecuteAsync(request with { Id = id }, ct);
        return Results.NoContent();
    }

    private static async Task<IResult> DeleteAsync(
        Guid id, DeleteInitiativeUseCase useCase, CancellationToken ct)
    {
        await useCase.ExecuteAsync(new DeleteInitiativeRequest(id), ct);
        return Results.NoContent();
    }
}
