using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.ControlTower.GetChapterCapacityOverview;

namespace GestionCapacidad.WebApi.Endpoints;

/// <summary>El resumen de capacidad del chapter que alimenta la Torre de control.</summary>
public sealed class ControlTowerEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/chapter")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("ControlTower");

        group.MapGet("/capacity-overview", GetCapacityOverviewAsync)
            .Produces<CapacityOverviewDto>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> GetCapacityOverviewAsync(
        GetChapterCapacityOverviewUseCase useCase, CancellationToken cancellationToken)
    {
        GetChapterCapacityOverviewResponse response = await useCase.ExecuteAsync(cancellationToken);
        return Results.Ok(response.Overview);
    }
}
