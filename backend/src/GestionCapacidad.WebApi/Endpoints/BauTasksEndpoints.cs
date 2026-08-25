using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.BauTasks.CreateBauTask;
using GestionCapacidad.Application.UseCases.BauTasks.DeleteBauTask;
using GestionCapacidad.Application.UseCases.BauTasks.GetBauTasks;
using GestionCapacidad.Application.UseCases.BauTasks.UpdateBauTask;

namespace GestionCapacidad.WebApi.Endpoints;

public sealed class BauTasksEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/squads/{squadId:guid}/bau-tasks")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("BauTasks");

        group.MapGet("/", GetAllAsync)
            .Produces<IReadOnlyList<BauTaskDto>>(StatusCodes.Status200OK);

        group.MapPost("/", CreateAsync)
            .Produces<CreateBauTaskResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{taskId:guid}", UpdateAsync)
            .Produces<UpdateBauTaskResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{taskId:guid}", DeleteAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetAllAsync(
        Guid squadId, GetBauTasksUseCase useCase, CancellationToken ct)
    {
        GetBauTasksResponse response = await useCase.ExecuteAsync(squadId, ct);
        return Results.Ok(response.Tasks);
    }

    private static async Task<IResult> CreateAsync(
        Guid squadId, CreateBauTaskRequest request,
        CreateBauTaskUseCase useCase, CancellationToken ct)
    {
        CreateBauTaskResponse response = await useCase.ExecuteAsync(
            request with { SquadId = squadId }, ct);
        return Results.Created($"api/v1/squads/{squadId}/bau-tasks/{response.BauTask.Id}", response.BauTask);
    }

    private static async Task<IResult> UpdateAsync(
        Guid squadId, Guid taskId, UpdateBauTaskRequest request,
        UpdateBauTaskUseCase useCase, CancellationToken ct)
    {
        UpdateBauTaskResponse response = await useCase.ExecuteAsync(
            request with { SquadId = squadId, TaskId = taskId }, ct);
        return Results.Ok(response.BauTask);
    }

    private static async Task<IResult> DeleteAsync(
        Guid squadId, Guid taskId, DeleteBauTaskUseCase useCase, CancellationToken ct)
    {
        await useCase.ExecuteAsync(new DeleteBauTaskRequest(squadId, taskId), ct);
        return Results.NoContent();
    }
}
