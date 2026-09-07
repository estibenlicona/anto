using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.ExpertiseLines.AddExpertiseLinePeople;
using GestionCapacidad.Application.UseCases.ExpertiseLines.ArchiveExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.CreateExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.GetExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.GetExpertiseLines;
using GestionCapacidad.Application.UseCases.ExpertiseLines.GetExpertiseRoster;
using GestionCapacidad.Application.UseCases.ExpertiseLines.ReactivateExpertiseLine;
using GestionCapacidad.Application.UseCases.ExpertiseLines.RemoveExpertiseLinePerson;
using GestionCapacidad.Application.UseCases.ExpertiseLines.SetExpertiseLineLead;
using GestionCapacidad.Application.UseCases.ExpertiseLines.UpdateExpertiseLine;

namespace GestionCapacidad.WebApi.Endpoints;

/// <summary>Las líneas de expertise (chapters): su lead, su gente y su capacidad.</summary>
public sealed class ExpertiseLinesEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/expertise-lines")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("ExpertiseLines");

        group.MapGet("/", ListAsync)
            .Produces<IReadOnlyList<ExpertiseLineDto>>(StatusCodes.Status200OK);

        group.MapPost("/", CreateAsync)
            .Produces<ExpertiseLineDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("/people", GetRosterAsync)
            .Produces<IReadOnlyList<RosterPersonDto>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", GetByIdAsync)
            .Produces<ExpertiseLineDetailDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{id:guid}", UpdateAsync)
            .Produces<ExpertiseLineDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/{id:guid}/archive", ArchiveAsync)
            .Produces<ExpertiseLineDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/{id:guid}/reactivate", ReactivateAsync)
            .Produces<ExpertiseLineDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{id:guid}/lead", SetLeadAsync)
            .Produces<ExpertiseLineDetailDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/{id:guid}/people", AddPeopleAsync)
            .Produces<ExpertiseLineDetailDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}/people/{personId:guid}", RemovePersonAsync)
            .Produces<ExpertiseLineDetailDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> ListAsync(GetExpertiseLinesUseCase useCase, CancellationToken cancellationToken)
    {
        GetExpertiseLinesResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Lines);
    }

    private static async Task<IResult> CreateAsync(
        UpsertExpertiseLineRequest request, CreateExpertiseLineUseCase useCase, CancellationToken cancellationToken)
    {
        CreateExpertiseLineResponse response = await useCase.ExecuteAsync(
            new CreateExpertiseLineRequest(request.Name, request.Code, request.Description), cancellationToken);
        return Results.Created($"/expertise-lines/{response.Line.Id}", response.Line);
    }

    private static async Task<IResult> GetRosterAsync(GetExpertiseRosterUseCase useCase, CancellationToken cancellationToken)
    {
        GetExpertiseRosterResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.People);
    }

    private static async Task<IResult> GetByIdAsync(Guid id, GetExpertiseLineUseCase useCase, CancellationToken cancellationToken)
    {
        GetExpertiseLineResponse response = await useCase.ExecuteAsync(new GetExpertiseLineRequest(id), cancellationToken);
        return Results.Ok(response.Line);
    }

    private static async Task<IResult> UpdateAsync(
        Guid id, UpsertExpertiseLineRequest request, UpdateExpertiseLineUseCase useCase, CancellationToken cancellationToken)
    {
        UpdateExpertiseLineResponse response = await useCase.ExecuteAsync(
            new UpdateExpertiseLineRequest(id, request.Name, request.Code, request.Description), cancellationToken);
        return Results.Ok(response.Line);
    }

    private static async Task<IResult> ArchiveAsync(Guid id, ArchiveExpertiseLineUseCase useCase, CancellationToken cancellationToken)
    {
        ArchiveExpertiseLineResponse response = await useCase.ExecuteAsync(new ArchiveExpertiseLineRequest(id), cancellationToken);
        return Results.Ok(response.Line);
    }

    private static async Task<IResult> ReactivateAsync(
        Guid id, ReactivateExpertiseLineUseCase useCase, CancellationToken cancellationToken)
    {
        ReactivateExpertiseLineResponse response = await useCase.ExecuteAsync(new ReactivateExpertiseLineRequest(id), cancellationToken);
        return Results.Ok(response.Line);
    }

    private static async Task<IResult> SetLeadAsync(
        Guid id, SetLineLeadRequest request, SetExpertiseLineLeadUseCase useCase, CancellationToken cancellationToken)
    {
        SetExpertiseLineLeadResponse response = await useCase.ExecuteAsync(
            new SetExpertiseLineLeadRequest(id, request.PersonId), cancellationToken);
        return Results.Ok(response.Line);
    }

    private static async Task<IResult> AddPeopleAsync(
        Guid id, AddLinePeopleRequest request, AddExpertiseLinePeopleUseCase useCase, CancellationToken cancellationToken)
    {
        AddExpertiseLinePeopleResponse response = await useCase.ExecuteAsync(
            new AddExpertiseLinePeopleRequest(id, request.PersonIds), cancellationToken);
        return Results.Ok(response.Line);
    }

    private static async Task<IResult> RemovePersonAsync(
        Guid id, Guid personId, RemoveExpertiseLinePersonUseCase useCase, CancellationToken cancellationToken)
    {
        RemoveExpertiseLinePersonResponse response = await useCase.ExecuteAsync(
            new RemoveExpertiseLinePersonRequest(id, personId), cancellationToken);
        return Results.Ok(response.Line);
    }
}
