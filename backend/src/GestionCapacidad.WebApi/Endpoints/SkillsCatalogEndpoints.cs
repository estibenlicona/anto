using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Skills.CreateSkill;
using GestionCapacidad.Application.UseCases.Skills.DeleteSkill;
using GestionCapacidad.Application.UseCases.Skills.GetSkillsCatalog;
using GestionCapacidad.Application.UseCases.Skills.SetSkillActive;
using GestionCapacidad.Application.UseCases.Skills.SetSkillCriteria;
using GestionCapacidad.Application.UseCases.Skills.SetSkillExpectation;
using GestionCapacidad.Application.UseCases.Skills.UpdateSkill;

namespace GestionCapacidad.WebApi.Endpoints;

/// <summary>El catálogo de habilidades: sus criterios por nivel y el nivel que cada cargo exige.</summary>
public sealed class SkillsCatalogEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/skills-catalog")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("SkillsCatalog");

        group.MapGet("/", GetCatalogAsync)
            .Produces<SkillsCatalogDto>(StatusCodes.Status200OK);

        group.MapPost("/skills", CreateAsync)
            .Produces<SkillDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/skills/{id:guid}", UpdateAsync)
            .Produces<SkillDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/skills/{id:guid}", DeleteAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/skills/{id:guid}/active", SetActiveAsync)
            .Produces<SkillDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/skills/{id:guid}/expectations", SetExpectationAsync)
            .Produces<SkillDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/skills/{id:guid}/levels/{level:int}/criteria", SetCriteriaAsync)
            .Produces<SkillDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetCatalogAsync(
        GetSkillsCatalogUseCase useCase,
        CancellationToken cancellationToken)
    {
        GetSkillsCatalogResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Catalog);
    }

    private static async Task<IResult> CreateAsync(
        UpsertSkillRequest request,
        CreateSkillUseCase useCase,
        CancellationToken cancellationToken)
    {
        CreateSkillResponse response = await useCase.ExecuteAsync(
            new CreateSkillRequest(request.Name, request.Group, request.Description), cancellationToken);
        return Results.Created($"/skills-catalog/skills/{response.Skill.Id}", response.Skill);
    }

    private static async Task<IResult> UpdateAsync(
        Guid id,
        UpsertSkillRequest request,
        UpdateSkillUseCase useCase,
        CancellationToken cancellationToken)
    {
        UpdateSkillResponse response = await useCase.ExecuteAsync(
            new UpdateSkillRequest(id, request.Name, request.Group, request.Description), cancellationToken);
        return Results.Ok(response.Skill);
    }

    private static async Task<IResult> DeleteAsync(
        Guid id,
        DeleteSkillUseCase useCase,
        CancellationToken cancellationToken)
    {
        await useCase.ExecuteAsync(new DeleteSkillRequest(id), cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> SetActiveAsync(
        Guid id,
        SetSkillActiveRequest request,
        SetSkillActiveUseCase useCase,
        CancellationToken cancellationToken)
    {
        SetSkillActiveResponse response = await useCase.ExecuteAsync(
            new SetSkillActiveCommand(id, request.Active), cancellationToken);
        return Results.Ok(response.Skill);
    }

    private static async Task<IResult> SetExpectationAsync(
        Guid id,
        SetExpectationRequest request,
        SetSkillExpectationUseCase useCase,
        CancellationToken cancellationToken)
    {
        SetSkillExpectationResponse response = await useCase.ExecuteAsync(
            new SetSkillExpectationRequest(id, request.Position, request.Level), cancellationToken);
        return Results.Ok(response.Skill);
    }

    private static async Task<IResult> SetCriteriaAsync(
        Guid id,
        int level,
        SetCriteriaRequest request,
        SetSkillCriteriaUseCase useCase,
        CancellationToken cancellationToken)
    {
        SetSkillCriteriaResponse response = await useCase.ExecuteAsync(
            new SetSkillCriteriaRequest(id, level, request.Criteria), cancellationToken);
        return Results.Ok(response.Skill);
    }
}
