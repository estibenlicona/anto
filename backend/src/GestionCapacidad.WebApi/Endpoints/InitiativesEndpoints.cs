using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Initiatives.ChangeInitiativeStatus;
using GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;
using GestionCapacidad.Application.UseCases.Initiatives.GetEvaluationModel;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiativeById;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiatives;
using GestionCapacidad.Application.UseCases.Initiatives.GetInitiativesStats;
using GestionCapacidad.Application.UseCases.Initiatives.SaveEvaluation;
using GestionCapacidad.Application.UseCases.Initiatives.UpdateInitiative;
using GestionCapacidad.WebApi.Extensions;

namespace GestionCapacidad.WebApi.Endpoints;

/// <summary>
/// Las iniciativas del chapter. El listado es global —no por célula— porque
/// la pregunta que responde el módulo es qué se está dimensionando en el
/// chapter, y la célula es apenas uno de sus filtros.
/// </summary>
public sealed class InitiativesEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/initiatives")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Initiatives");

        group.MapGet("/", GetAllAsync)
            .Produces<PagedResult<InitiativeDto>>(StatusCodes.Status200OK);

        // Rutas literales antes de /{id:guid}; el constraint evita el choque
        // igualmente, como en People y Squads.
        group.MapGet("/evaluation-model", GetEvaluationModelAsync)
            .Produces<EvaluationModelDto>(StatusCodes.Status200OK);

        group.MapGet("/stats", GetStatsAsync)
            .Produces<InitiativesStatsDto>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", GetByIdAsync)
            .WithName("GetInitiativeById")
            .Produces<InitiativeDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", CreateAsync)
            .Produces<InitiativeDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", UpdateAsync)
            .Produces<InitiativeDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{id:guid}/evaluation", SaveEvaluationAsync)
            .Produces<InitiativeDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{id:guid}/status", ChangeStatusAsync)
            .Produces<InitiativeDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetAllAsync(
        GetInitiativesUseCase useCase,
        CancellationToken cancellationToken,
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string[]? status = null,
        Guid[]? squadId = null,
        string[]? talla = null)
    {
        (int clampedPage, int clampedPageSize) = PaginationQueryExtensions.ClampPagination(page, pageSize);

        GetInitiativesResponse response = await useCase.ExecuteAsync(
            new GetInitiativesRequest(clampedPage, clampedPageSize, search, status, squadId, talla),
            cancellationToken);

        return Results.Ok(response.Initiatives);
    }

    private static async Task<IResult> GetEvaluationModelAsync(
        GetEvaluationModelUseCase useCase, CancellationToken cancellationToken)
    {
        GetEvaluationModelResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Model);
    }

    private static async Task<IResult> GetStatsAsync(
        GetInitiativesStatsUseCase useCase, CancellationToken cancellationToken)
    {
        GetInitiativesStatsResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Stats);
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id, GetInitiativeByIdUseCase useCase, CancellationToken cancellationToken)
    {
        GetInitiativeByIdResponse response = await useCase.ExecuteAsync(
            new GetInitiativeByIdRequest(id), cancellationToken);

        return Results.Ok(response.Initiative);
    }

    private static async Task<IResult> CreateAsync(
        CreateInitiativeRequest request,
        CreateInitiativeUseCase useCase,
        CancellationToken cancellationToken)
    {
        CreateInitiativeResponse response = await useCase.ExecuteAsync(request, cancellationToken);
        return Results.CreatedAtRoute("GetInitiativeById", new { id = response.Initiative.Id }, response.Initiative);
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpdateInitiativeRequest request,
        UpdateInitiativeUseCase useCase,
        CancellationToken cancellationToken)
    {
        UpdateInitiativeResponse response = await useCase.ExecuteAsync(
            request with { Id = id }, cancellationToken);

        return Results.Ok(response.Initiative);
    }

    private static async Task<IResult> SaveEvaluationAsync(
        Guid id,
        SaveEvaluationBody body,
        SaveEvaluationUseCase useCase,
        CancellationToken cancellationToken)
    {
        SaveEvaluationResponse response = await useCase.ExecuteAsync(
            new SaveEvaluationRequest(id, body.Triage, body.Answers, body.TargetMonths),
            cancellationToken);

        return Results.Ok(response.Initiative);
    }

    private static async Task<IResult> ChangeStatusAsync(
        Guid id,
        SetInitiativeStatusBody body,
        ChangeInitiativeStatusUseCase useCase,
        CancellationToken cancellationToken)
    {
        ChangeInitiativeStatusResponse response = await useCase.ExecuteAsync(
            new ChangeInitiativeStatusRequest(id, body.Status), cancellationToken);

        return Results.Ok(response.Initiative);
    }
}

/// <summary>El cuerpo del contrato; el id viaja en la ruta.</summary>
public sealed record SaveEvaluationBody(
    IReadOnlyList<bool> Triage,
    IReadOnlyDictionary<string, int> Answers,
    int TargetMonths);

public sealed record SetInitiativeStatusBody(string Status);
