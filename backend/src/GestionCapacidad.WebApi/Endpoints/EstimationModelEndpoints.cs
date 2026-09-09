using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Estimation;
using GestionCapacidad.Application.UseCases.Admin;

namespace GestionCapacidad.WebApi.Endpoints;

/// <summary>
/// El modelo de estimación y sus versiones.
///
/// Tres códigos cuentan la historia del recurso: **409** cuando se intenta
/// escribir sobre una versión que ya no es borrador —no es un error del cuerpo,
/// es que el recurso está en un estado que no admite la operación—, **422**
/// cuando la publicación se rechaza por la validación, con los impedimentos en
/// el cuerpo para poder ir a arreglarlos, y **400** cuando falta el autor, sin
/// el cual el historial quedaría anónimo.
/// </summary>
public sealed class EstimationModelEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/admin/modelos")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Modelo de estimación");

        group.MapGet("/", GetModelsAsync)
            .Produces<IReadOnlyList<EstimationModelListItemDto>>(StatusCodes.Status200OK);

        group.MapPost("/{modelId:guid}/versiones", CreateVersionAsync)
            .Produces<CreateModelVersionResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/{modelId:guid}/versiones/{numero:int}", GetVersionAsync)
            .Produces<EstimationModelVersionDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/{modelId:guid}/versiones/{numero:int}/validacion", GetValidationAsync)
            .Produces<ModelValidationReportDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/{modelId:guid}/versiones/{numero:int}/diferencias", GetDiffAsync)
            .Produces<ModelVersionDiffDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapGet("/{modelId:guid}/versiones/{numero:int}/historial", GetHistoryAsync)
            .Produces<IReadOnlyList<ModelChangeEntryDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{modelId:guid}/versiones/{numero:int}/dimensiones", SaveDimensionsAsync)
            .Produces<ModelValidationReportDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status409Conflict);

        group.MapPut("/{modelId:guid}/versiones/{numero:int}/drivers", SaveDriversAsync)
            .Produces<ModelValidationReportDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status409Conflict);

        group.MapPut("/{modelId:guid}/versiones/{numero:int}/tallas", SaveTallaRulesAsync)
            .Produces<ModelValidationReportDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status409Conflict);

        group.MapPut("/{modelId:guid}/versiones/{numero:int}/mix", SaveMixAsync)
            .Produces<ModelValidationReportDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status409Conflict);

        group.MapPost("/{modelId:guid}/versiones/{numero:int}/publicacion", PublishAsync)
            .Produces<ModelValidationReportDto>(StatusCodes.Status200OK)
            .Produces<ModelValidationReportDto>(StatusCodes.Status422UnprocessableEntity)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status409Conflict);

        // El modelo con el que se estima hoy. Vive fuera de /admin porque lo lee
        // quien evalúa, no quien administra.
        app.MapGroup("api/v{version:apiVersion}/iniciativas")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Iniciativas")
            .MapGet("/modelo-estimacion", GetCurrentVersionAsync)
            .Produces<EstimationModelVersionDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetModelsAsync(
        GetEstimationModelsUseCase useCase, CancellationToken cancellationToken)
    {
        GetEstimationModelsResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Models);
    }

    private static async Task<IResult> CreateVersionAsync(
        Guid modelId,
        CreateModelVersionRequest request,
        CreateModelVersionUseCase useCase,
        CancellationToken cancellationToken)
    {
        CreateModelVersionResponse response =
            await useCase.ExecuteAsync(new CreateModelVersionCommand(modelId, request), cancellationToken);

        return Results.Created($"/api/v1/admin/modelos/{modelId}/versiones/{response.Number}", response);
    }

    private static async Task<IResult> GetVersionAsync(
        Guid modelId,
        int numero,
        GetModelVersionContentUseCase useCase,
        CancellationToken cancellationToken)
    {
        GetModelVersionContentResponse response =
            await useCase.ExecuteAsync(new ModelVersionQuery(modelId, numero), cancellationToken);

        return Results.Ok(response.Version);
    }

    private static async Task<IResult> GetValidationAsync(
        Guid modelId,
        int numero,
        GetModelVersionValidationUseCase useCase,
        CancellationToken cancellationToken)
    {
        GetModelVersionValidationResponse response =
            await useCase.ExecuteAsync(new ModelVersionQuery(modelId, numero), cancellationToken);

        return Results.Ok(response.Report);
    }

    private static async Task<IResult> GetDiffAsync(
        Guid modelId,
        int numero,
        GetModelVersionDiffUseCase useCase,
        CancellationToken cancellationToken)
    {
        GetModelVersionDiffResponse response =
            await useCase.ExecuteAsync(new ModelVersionQuery(modelId, numero), cancellationToken);

        return Results.Ok(response.Diff);
    }

    private static async Task<IResult> GetHistoryAsync(
        Guid modelId,
        int numero,
        GetModelVersionHistoryUseCase useCase,
        CancellationToken cancellationToken)
    {
        GetModelVersionHistoryResponse response =
            await useCase.ExecuteAsync(new ModelVersionQuery(modelId, numero), cancellationToken);

        return Results.Ok(response.Entries);
    }

    private static async Task<IResult> SaveDimensionsAsync(
        Guid modelId,
        int numero,
        SaveDimensionsRequest request,
        SaveModelDimensionsUseCase useCase,
        CancellationToken cancellationToken)
    {
        GetModelVersionValidationResponse response = await useCase.ExecuteAsync(
            new SaveDimensionsCommand(modelId, numero, request), cancellationToken);

        return Results.Ok(response.Report);
    }

    private static async Task<IResult> SaveDriversAsync(
        Guid modelId,
        int numero,
        SaveDriversRequest request,
        SaveModelDriversUseCase useCase,
        CancellationToken cancellationToken)
    {
        GetModelVersionValidationResponse response = await useCase.ExecuteAsync(
            new SaveDriversCommand(modelId, numero, request), cancellationToken);

        return Results.Ok(response.Report);
    }

    private static async Task<IResult> SaveTallaRulesAsync(
        Guid modelId,
        int numero,
        SaveTallaRulesRequest request,
        SaveModelTallaRulesUseCase useCase,
        CancellationToken cancellationToken)
    {
        GetModelVersionValidationResponse response = await useCase.ExecuteAsync(
            new SaveTallaRulesCommand(modelId, numero, request), cancellationToken);

        return Results.Ok(response.Report);
    }

    private static async Task<IResult> SaveMixAsync(
        Guid modelId,
        int numero,
        SaveMixRequest request,
        SaveModelMixUseCase useCase,
        CancellationToken cancellationToken)
    {
        GetModelVersionValidationResponse response = await useCase.ExecuteAsync(
            new SaveMixCommand(modelId, numero, request), cancellationToken);

        return Results.Ok(response.Report);
    }

    private static async Task<IResult> PublishAsync(
        Guid modelId,
        int numero,
        PublishModelVersionRequest request,
        PublishModelVersionUseCase useCase,
        CancellationToken cancellationToken)
    {
        PublishModelVersionResponse response = await useCase.ExecuteAsync(
            new PublishModelVersionCommand(modelId, numero, request), cancellationToken);

        // 422 y no 400: el cuerpo está bien formado, lo que no se puede es
        // publicar *esta* configuración. El informe viaja igual para que el
        // cliente pueda llevar a arreglar cada impedimento.
        return response.Published
            ? Results.Ok(response.Report)
            : Results.UnprocessableEntity(response.Report);
    }

    private static async Task<IResult> GetCurrentVersionAsync(
        IEstimationVersionProvider provider,
        CancellationToken cancellationToken)
    {
        EstimationModelVersionDto? version = await provider.GetCurrentAsync(1, cancellationToken);

        return version is null
            ? Results.NotFound(new { detail = "Todavía no hay una versión vigente del modelo de estimación." })
            : Results.Ok(version);
    }
}
