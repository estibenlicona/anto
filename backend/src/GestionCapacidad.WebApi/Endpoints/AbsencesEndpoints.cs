using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Absences.CreateAbsence;
using GestionCapacidad.Application.UseCases.Absences.GetAbsencesByMonth;
using GestionCapacidad.Application.UseCases.Absences.UpdateAbsenceStatus;

namespace GestionCapacidad.WebApi.Endpoints;

/// <summary>
/// Las ausencias del chapter, siempre leídas por mes: los días y los impactos
/// que responde cada una están expresados contra el mes que se pregunta.
/// </summary>
public sealed class AbsencesEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/absences")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Absences");

        group.MapGet("/", GetByMonthAsync)
            .Produces<AbsencesMonthDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/", CreateAsync)
            .Produces<AbsenceDto>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}/status", UpdateStatusAsync)
            .Produces<AbsenceDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);
    }

    /// <summary>
    /// El mes es obligatorio: sin él no hay denominador con el que expresar
    /// los impactos, así que la ausencia del parámetro es un 400 y no un
    /// listado completo.
    /// </summary>
    private static async Task<IResult> GetByMonthAsync(
        GetAbsencesByMonthUseCase useCase,
        CancellationToken cancellationToken,
        string? month = null)
    {
        GetAbsencesByMonthResponse response = await useCase.ExecuteAsync(
            new GetAbsencesByMonthRequest(month), cancellationToken);

        return Results.Ok(response.Month);
    }

    private static async Task<IResult> CreateAsync(
        CreateAbsenceRequest request,
        CreateAbsenceUseCase useCase,
        CancellationToken cancellationToken)
    {
        CreateAbsenceResponse response = await useCase.ExecuteAsync(request, cancellationToken);

        // Sin ruta propia de detalle: la ausencia se lee dentro de su mes.
        return Results.Created($"/absences/{response.Absence.Id}", response.Absence);
    }

    private static async Task<IResult> UpdateStatusAsync(
        Guid id,
        UpdateAbsenceStatusBody body,
        UpdateAbsenceStatusUseCase useCase,
        CancellationToken cancellationToken)
    {
        UpdateAbsenceStatusResponse response = await useCase.ExecuteAsync(
            new UpdateAbsenceStatusRequest(id, body.Status, body.Reason), cancellationToken);

        return Results.Ok(response.Absence);
    }
}

/// <summary>
/// El cuerpo del contrato; el id viaja en la ruta. <c>Reason</c> es opcional
/// porque sólo el rechazo lo exige.
/// </summary>
public sealed record UpdateAbsenceStatusBody(string Status, string? Reason);
