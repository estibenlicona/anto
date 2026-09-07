using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Assessments.CloseAssessment;
using GestionCapacidad.Application.UseCases.Assessments.GetAssessment;
using GestionCapacidad.Application.UseCases.Assessments.OpenAssessment;
using GestionCapacidad.Application.UseCases.Assessments.SaveAssessmentSkill;

namespace GestionCapacidad.WebApi.Endpoints;

/// <summary>La evaluación de una persona por ciclo: abrirla, calificar sus habilidades y cerrarla.</summary>
public sealed class AssessmentsEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/people/{personId:guid}/assessment")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Assessments");

        group.MapGet("/", GetAsync)
            .Produces<AssessmentDto?>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", OpenAsync)
            .Produces<AssessmentDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{assessmentId:guid}/skills/{skillId:guid}", SaveSkillAsync)
            .Produces<AssessmentDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{assessmentId:guid}/close", CloseAsync)
            .Produces<AssessmentDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetAsync(
        Guid personId,
        GetAssessmentUseCase useCase,
        CancellationToken cancellationToken,
        string? cycle = null)
    {
        GetAssessmentResponse response = await useCase.ExecuteAsync(new GetAssessmentRequest(personId, cycle), cancellationToken);
        return Results.Ok(response.Assessment);
    }

    private static async Task<IResult> OpenAsync(
        Guid personId,
        OpenAssessmentUseCase useCase,
        CancellationToken cancellationToken)
    {
        OpenAssessmentResponse response = await useCase.ExecuteAsync(new OpenAssessmentRequest(personId), cancellationToken);
        return Results.Created($"/people/{personId}/assessment/{response.Assessment.Id}", response.Assessment);
    }

    private static async Task<IResult> SaveSkillAsync(
        Guid personId,
        Guid assessmentId,
        Guid skillId,
        SaveSkillRequest request,
        SaveAssessmentSkillUseCase useCase,
        CancellationToken cancellationToken)
    {
        SaveAssessmentSkillResponse response = await useCase.ExecuteAsync(
            new SaveAssessmentSkillCommand(personId, assessmentId, skillId, request.Level, request.Met, request.Note),
            cancellationToken);
        return Results.Ok(response.Assessment);
    }

    private static async Task<IResult> CloseAsync(
        Guid personId,
        Guid assessmentId,
        CloseAssessmentUseCase useCase,
        CancellationToken cancellationToken)
    {
        CloseAssessmentResponse response = await useCase.ExecuteAsync(
            new CloseAssessmentRequest(personId, assessmentId), cancellationToken);
        return Results.Ok(response.Assessment);
    }
}
