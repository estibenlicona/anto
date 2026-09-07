using Asp.Versioning;
using Asp.Versioning.Builder;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Billing.GeneratePrefactures;
using GestionCapacidad.Application.UseCases.Billing.GetPrefactureById;
using GestionCapacidad.Application.UseCases.Billing.GetPrefactures;
using GestionCapacidad.Application.UseCases.Billing.RegisterPrefactureDocument;
using GestionCapacidad.Application.UseCases.Billing.RemoveBillingAdjustment;
using GestionCapacidad.Application.UseCases.Billing.SetBillingAdjustment;
using GestionCapacidad.Application.UseCases.Billing.SetBillingStatus;
using GestionCapacidad.Application.UseCases.Billing.SetPrefacturedAmount;

namespace GestionCapacidad.WebApi.Endpoints;

/// <summary>
/// Las prefacturas del período: una por persona externa. Generar, recibir el
/// documento del proveedor, ajustar y decidir son pasos separados porque cada
/// uno lo hace un rol distinto, en un momento distinto.
/// </summary>
public sealed class BillingEndpoints : IEndpointDefinition
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        ApiVersionSet versionSet = app.NewApiVersionSet()
            .HasApiVersion(new ApiVersion(1, 0))
            .ReportApiVersions()
            .Build();

        RouteGroupBuilder group = app
            .MapGroup("api/v{version:apiVersion}/billing")
            .WithApiVersionSet(versionSet)
            .MapToApiVersion(1, 0)
            .WithTags("Billing");

        group.MapGet("/", GetPrefacturesAsync)
            .Produces<IReadOnlyList<PrefactureDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapPost("/generate", GenerateAsync)
            .Produces<IReadOnlyList<PrefactureDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapGet("/{id:guid}", GetByIdAsync)
            .Produces<PrefactureDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/{id:guid}/prefacture", RegisterDocumentAsync)
            .Produces<PrefactureDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{id:guid}/prefactured", SetPrefacturedAsync)
            .Produces<PrefactureDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{id:guid}/adjustment", SetAdjustmentAsync)
            .Produces<PrefactureDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}/adjustment", RemoveAdjustmentAsync)
            .Produces<PrefactureDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPut("/{id:guid}/status", SetStatusAsync)
            .Produces<PrefactureDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetPrefacturesAsync(
        GetPrefacturesUseCase useCase,
        CancellationToken cancellationToken,
        string? period = null)
    {
        GetPrefacturesResponse response = await useCase.ExecuteAsync(new GetPrefacturesRequest(period), cancellationToken);
        return Results.Ok(response.Items);
    }

    private static async Task<IResult> GenerateAsync(
        GeneratePrefacturesRequest request,
        GeneratePrefacturesUseCase useCase,
        CancellationToken cancellationToken)
    {
        GeneratePrefacturesResponse response = await useCase.ExecuteAsync(request, cancellationToken);
        return Results.Ok(response.Created);
    }

    private static async Task<IResult> GetByIdAsync(
        Guid id,
        GetPrefactureByIdUseCase useCase,
        CancellationToken cancellationToken)
    {
        GetPrefactureByIdResponse response = await useCase.ExecuteAsync(new GetPrefactureByIdRequest(id), cancellationToken);
        return Results.Ok(response.Prefacture);
    }

    private static async Task<IResult> RegisterDocumentAsync(
        Guid id,
        RegisterPrefactureRequest request,
        RegisterPrefactureDocumentUseCase useCase,
        CancellationToken cancellationToken)
    {
        RegisterPrefactureDocumentResponse response = await useCase.ExecuteAsync(
            new RegisterPrefactureDocumentRequest(id, request), cancellationToken);
        return Results.Ok(response.Prefacture);
    }

    private static async Task<IResult> SetPrefacturedAsync(
        Guid id,
        SetPrefacturedRequest request,
        SetPrefacturedAmountUseCase useCase,
        CancellationToken cancellationToken)
    {
        SetPrefacturedAmountResponse response = await useCase.ExecuteAsync(
            new SetPrefacturedAmountRequest(id, request.Prefactured), cancellationToken);
        return Results.Ok(response.Prefacture);
    }

    private static async Task<IResult> SetAdjustmentAsync(
        Guid id,
        BillingAdjustmentDto request,
        SetBillingAdjustmentUseCase useCase,
        CancellationToken cancellationToken)
    {
        SetBillingAdjustmentResponse response = await useCase.ExecuteAsync(
            new SetBillingAdjustmentCommand(id, request.Amount, request.Reason, request.Note), cancellationToken);
        return Results.Ok(response.Prefacture);
    }

    private static async Task<IResult> RemoveAdjustmentAsync(
        Guid id,
        RemoveBillingAdjustmentUseCase useCase,
        CancellationToken cancellationToken)
    {
        RemoveBillingAdjustmentResponse response = await useCase.ExecuteAsync(
            new RemoveBillingAdjustmentRequest(id), cancellationToken);
        return Results.Ok(response.Prefacture);
    }

    private static async Task<IResult> SetStatusAsync(
        Guid id,
        SetBillingStatusRequest request,
        SetBillingStatusUseCase useCase,
        CancellationToken cancellationToken)
    {
        SetBillingStatusResponse response = await useCase.ExecuteAsync(
            new SetBillingStatusCommand(id, request.Status, request.Note, request.Reason), cancellationToken);
        return Results.Ok(response.Prefacture);
    }
}
