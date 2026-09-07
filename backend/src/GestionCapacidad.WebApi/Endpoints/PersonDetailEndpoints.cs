using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.PersonDetail.GetPersonDetail;
using GestionCapacidad.Application.UseCases.PersonDetail.LinkDevOpsIdentity;
using GestionCapacidad.Application.UseCases.PersonDetail.SearchDevOpsUser;

namespace GestionCapacidad.WebApi.Endpoints;

/// <summary>La ficha agregada de una persona, la vinculación de su identidad DevOps y su búsqueda por correo.</summary>
public sealed class PersonDetailEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/people")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("PersonDetail");

        group.MapGet("/{id:guid}/detail", GetDetailAsync)
            .Produces<PersonDetailDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/{id:guid}/devops-identity", LinkDevOpsIdentityAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status409Conflict);

        RouteGroupBuilder devOpsGroup = app
            .MapGroup("api/v{version:apiVersion}/devops")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("PersonDetail");

        devOpsGroup.MapGet("/users", SearchDevOpsUserAsync)
            .Produces<DevOpsUserDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetDetailAsync(Guid id, GetPersonDetailUseCase useCase, CancellationToken cancellationToken)
    {
        GetPersonDetailResponse response = await useCase.ExecuteAsync(new GetPersonDetailRequest(id), cancellationToken);
        return Results.Ok(response.Detail);
    }

    private static async Task<IResult> LinkDevOpsIdentityAsync(
        Guid id, LinkDevOpsIdentityRequest request, LinkDevOpsIdentityUseCase useCase, CancellationToken cancellationToken)
    {
        await useCase.ExecuteAsync(new LinkDevOpsIdentityCommand(id, request.IdentityId), cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> SearchDevOpsUserAsync(
        SearchDevOpsUserUseCase useCase, CancellationToken cancellationToken, string? email = null)
    {
        SearchDevOpsUserResponse response = await useCase.ExecuteAsync(new SearchDevOpsUserRequest(email), cancellationToken);
        return Results.Ok(response.User);
    }
}
