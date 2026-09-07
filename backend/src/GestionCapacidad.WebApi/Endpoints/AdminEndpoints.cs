using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Admin.GetCapabilityMix;
using GestionCapacidad.Application.UseCases.Admin.GetQuestionPool;
using GestionCapacidad.Application.UseCases.Admin.GetSprintConfig;
using GestionCapacidad.Application.UseCases.Admin.GetTallaBands;
using GestionCapacidad.Application.UseCases.Admin.SaveCapabilityMix;
using GestionCapacidad.Application.UseCases.Admin.SaveQuestionPool;
using GestionCapacidad.Application.UseCases.Admin.SaveSprintConfig;
using GestionCapacidad.Application.UseCases.Admin.SaveTallaBands;

namespace GestionCapacidad.WebApi.Endpoints;

/// <summary>
/// Los parámetros del modelo: calendario de sprints, bandas de talla, mix de
/// capacidades y pool de preguntas. Cada uno se lee entero y se guarda
/// entero — no hay parches parciales — y el <c>PUT</c> responde 200 con lo
/// guardado, no 201: no se crea un recurso nuevo, se reemplaza el vigente.
/// </summary>
public sealed class AdminEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/admin")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Admin");

        group.MapGet("/sprint-config", GetSprintConfigAsync)
            .Produces<SprintConfigDto>(StatusCodes.Status200OK);

        group.MapPut("/sprint-config", SaveSprintConfigAsync)
            .Produces<SprintConfigDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("/talla-bands", GetTallaBandsAsync)
            .Produces<TallaBandsDto>(StatusCodes.Status200OK);

        group.MapPut("/talla-bands", SaveTallaBandsAsync)
            .Produces<TallaBandsDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("/capability-mix", GetCapabilityMixAsync)
            .Produces<IReadOnlyList<CapabilityMixRowDto>>(StatusCodes.Status200OK);

        group.MapPut("/capability-mix", SaveCapabilityMixAsync)
            .Produces<IReadOnlyList<CapabilityMixRowDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("/question-pool", GetQuestionPoolAsync)
            .Produces<IReadOnlyList<QuestionPoolRowDto>>(StatusCodes.Status200OK);

        group.MapPut("/question-pool", SaveQuestionPoolAsync)
            .Produces<IReadOnlyList<QuestionPoolRowDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);
    }

    // ── Calendario de sprints ────────────────────────────────────────────────

    private static async Task<IResult> GetSprintConfigAsync(
        GetSprintConfigUseCase useCase, CancellationToken cancellationToken)
    {
        GetSprintConfigResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Config);
    }

    private static async Task<IResult> SaveSprintConfigAsync(
        SaveSprintConfigRequest request,
        SaveSprintConfigUseCase useCase,
        CancellationToken cancellationToken)
    {
        SaveSprintConfigResponse response = await useCase.ExecuteAsync(request, cancellationToken);
        return Results.Ok(response.Config);
    }

    // ── Bandas de talla ──────────────────────────────────────────────────────

    private static async Task<IResult> GetTallaBandsAsync(
        GetTallaBandsUseCase useCase, CancellationToken cancellationToken)
    {
        GetTallaBandsResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Bands);
    }

    private static async Task<IResult> SaveTallaBandsAsync(
        SaveTallaBandsRequest request,
        SaveTallaBandsUseCase useCase,
        CancellationToken cancellationToken)
    {
        SaveTallaBandsResponse response = await useCase.ExecuteAsync(request, cancellationToken);
        return Results.Ok(response.Bands);
    }

    // ── Mix de capacidades ───────────────────────────────────────────────────

    private static async Task<IResult> GetCapabilityMixAsync(
        GetCapabilityMixUseCase useCase, CancellationToken cancellationToken)
    {
        GetCapabilityMixResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Rows);
    }

    /// <summary>
    /// El contrato manda un arreglo desnudo; se envuelve acá porque la
    /// validación trabaja sobre un objeto raíz.
    /// </summary>
    private static async Task<IResult> SaveCapabilityMixAsync(
        CapabilityMixRowDto[] rows,
        SaveCapabilityMixUseCase useCase,
        CancellationToken cancellationToken)
    {
        SaveCapabilityMixResponse response = await useCase.ExecuteAsync(
            new SaveCapabilityMixRequest(rows), cancellationToken);

        return Results.Ok(response.Rows);
    }

    // ── Pool de preguntas ────────────────────────────────────────────────────

    private static async Task<IResult> GetQuestionPoolAsync(
        GetQuestionPoolUseCase useCase, CancellationToken cancellationToken)
    {
        GetQuestionPoolResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Questions);
    }

    private static async Task<IResult> SaveQuestionPoolAsync(
        QuestionPoolRowDto[] questions,
        SaveQuestionPoolUseCase useCase,
        CancellationToken cancellationToken)
    {
        SaveQuestionPoolResponse response = await useCase.ExecuteAsync(
            new SaveQuestionPoolRequest(questions), cancellationToken);

        return Results.Ok(response.Questions);
    }
}
