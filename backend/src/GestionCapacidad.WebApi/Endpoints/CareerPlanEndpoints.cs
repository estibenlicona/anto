using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.CareerPlan.CreatePlanAction;
using GestionCapacidad.Application.UseCases.CareerPlan.GetPersonPlan;
using GestionCapacidad.Application.UseCases.CareerPlan.GetSpanMatrix;
using GestionCapacidad.Application.UseCases.CareerPlan.GetSpanSummary;
using GestionCapacidad.Application.UseCases.CareerPlan.SetPlanActionStatus;

namespace GestionCapacidad.WebApi.Endpoints;

/// <summary>El span de habilidades del chapter y el plan de carrera de cada persona.</summary>
public sealed class CareerPlanEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/career-plan")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("CareerPlan");

        group.MapGet("/span", GetSpanAsync)
            .Produces<SpanMatrixDto>(StatusCodes.Status200OK);

        group.MapGet("/span/summary", GetSpanSummaryAsync)
            .Produces<SpanSummaryDto>(StatusCodes.Status200OK);

        group.MapGet("/people/{personId:guid}/plan", GetPersonPlanAsync)
            .Produces<PersonPlanDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/people/{personId:guid}/plan/actions", CreatePlanActionAsync)
            .Produces<PersonPlanDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/people/{personId:guid}/plan/actions/{actionId:guid}/status", SetPlanActionStatusAsync)
            .Produces<PersonPlanDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetSpanAsync(GetSpanMatrixUseCase useCase, CancellationToken cancellationToken)
    {
        GetSpanMatrixResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Span);
    }

    private static async Task<IResult> GetSpanSummaryAsync(GetSpanSummaryUseCase useCase, CancellationToken cancellationToken)
    {
        GetSpanSummaryResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Summary);
    }

    private static async Task<IResult> GetPersonPlanAsync(
        Guid personId, GetPersonPlanUseCase useCase, CancellationToken cancellationToken)
    {
        GetPersonPlanResponse response = await useCase.ExecuteAsync(new GetPersonPlanRequest(personId), cancellationToken);
        return Results.Ok(response.Plan);
    }

    private static async Task<IResult> CreatePlanActionAsync(
        Guid personId, CreatePlanActionRequest request, CreatePlanActionUseCase useCase, CancellationToken cancellationToken)
    {
        CreatePlanActionResponse response = await useCase.ExecuteAsync(
            new CreatePlanActionCommand(personId, request.SkillId, request.TargetLevel, request.DueMonth, request.Title),
            cancellationToken);
        return Results.Created($"/career-plan/people/{personId}/plan", response.Plan);
    }

    private static async Task<IResult> SetPlanActionStatusAsync(
        Guid personId, Guid actionId, SetPlanActionStatusRequest request, SetPlanActionStatusUseCase useCase, CancellationToken cancellationToken)
    {
        SetPlanActionStatusResponse response = await useCase.ExecuteAsync(
            new SetPlanActionStatusCommand(personId, actionId, request.Status), cancellationToken);
        return Results.Ok(response.Plan);
    }
}
