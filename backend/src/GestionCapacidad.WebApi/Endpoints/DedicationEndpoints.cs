using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Dedication.GetCollaboratorDetail;
using GestionCapacidad.Application.UseCases.Dedication.GetCollaborators;
using GestionCapacidad.Application.UseCases.Dedication.SyncAllCollaborators;
using GestionCapacidad.Application.UseCases.Dedication.SyncCollaborator;

namespace GestionCapacidad.WebApi.Endpoints;

/// <summary>El balance de carga de los colaboradores del chapter, sprint a sprint.</summary>
public sealed class DedicationEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/dedication")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Dedication");

        group.MapGet("/collaborators", ListAsync)
            .Produces<CollaboratorDedicationListDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("/collaborators/{personId:guid}", GetDetailAsync)
            .Produces<CollaboratorDedicationDetailDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/collaborators/{personId:guid}/sync", SyncCollaboratorAsync)
            .Produces<SyncResultDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status502BadGateway);

        group.MapPost("/collaborators/sync", SyncAllCollaboratorsAsync)
            .Produces<SyncResultDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status502BadGateway);
    }

    private static async Task<IResult> ListAsync(
        GetCollaboratorsUseCase useCase,
        CancellationToken cancellationToken,
        string? sprint = null,
        int page = 1,
        int pageSize = 20,
        string? search = null,
        Guid[]? squadId = null)
    {
        GetCollaboratorsResponse response = await useCase.ExecuteAsync(
            new GetCollaboratorsRequest(sprint, page, pageSize, search, squadId), cancellationToken);
        return Results.Ok(response.List);
    }

    private static async Task<IResult> GetDetailAsync(
        Guid personId,
        GetCollaboratorDetailUseCase useCase,
        CancellationToken cancellationToken,
        string? sprint = null)
    {
        GetCollaboratorDetailResponse response = await useCase.ExecuteAsync(
            new GetCollaboratorDetailRequest(personId, sprint), cancellationToken);
        return Results.Ok(response.Detail);
    }

    private static async Task<IResult> SyncCollaboratorAsync(
        Guid personId, SyncCollaboratorUseCase useCase, CancellationToken cancellationToken)
    {
        SyncCollaboratorResponse response = await useCase.ExecuteAsync(new SyncCollaboratorCommand(personId), cancellationToken);
        return Results.Ok(response.Result);
    }

    private static async Task<IResult> SyncAllCollaboratorsAsync(SyncAllCollaboratorsUseCase useCase, CancellationToken cancellationToken)
    {
        SyncAllCollaboratorsResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Result);
    }
}
