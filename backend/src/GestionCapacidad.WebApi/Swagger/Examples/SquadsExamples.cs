using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Squads.CreateSquad;
using GestionCapacidad.Application.UseCases.Squads.GetSquadById;
using GestionCapacidad.Application.UseCases.Squads.UpdateSquad;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

public sealed class SquadDtoExample : IExamplesProvider<SquadDto>
{
    public SquadDto GetExamples() => new(
        Id: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        Name: "Squad Pagos",
        Criticality: "High",
        Tribe: "Medios de Pago",
        Description: "Squad responsable de la pasarela de pagos y conciliación",
        DevOpsBoardId: Guid.Parse("66666666-6666-6666-6666-666666666666"),
        CreatedAtUtc: DateTime.Parse("2025-11-01T08:00:00Z"),
        UpdatedAtUtc: null);
}

public sealed class CreateSquadRequestExample : IExamplesProvider<CreateSquadRequest>
{
    public CreateSquadRequest GetExamples() => new(
        Name: "Squad Pagos",
        Criticality: "High",
        Tribe: "Medios de Pago",
        Description: "Squad responsable de la pasarela de pagos y conciliación");
}

public sealed class CreateSquadResponseExample : IExamplesProvider<CreateSquadResponse>
{
    public CreateSquadResponse GetExamples() => new(
        Id: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        Name: "Squad Pagos",
        Criticality: "High",
        Tribe: "Medios de Pago",
        Description: "Squad responsable de la pasarela de pagos y conciliación",
        CreatedAtUtc: DateTime.Parse("2025-11-01T08:00:00Z"));
}

public sealed class GetSquadByIdResponseExample : IExamplesProvider<GetSquadByIdResponse>
{
    public GetSquadByIdResponse GetExamples() => new(new SquadDtoExample().GetExamples());
}

public sealed class UpdateSquadRequestExample : IExamplesProvider<UpdateSquadRequest>
{
    public UpdateSquadRequest GetExamples() => new(
        Id: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        Name: "Squad Pagos",
        Criticality: "Critical",
        Tribe: "Medios de Pago",
        Description: "Squad responsable de la pasarela de pagos, conciliación y fraude");
}

public sealed class UpdateSquadResponseExample : IExamplesProvider<UpdateSquadResponse>
{
    public UpdateSquadResponse GetExamples() => new(
        Id: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        Name: "Squad Pagos",
        Criticality: "Critical",
        Tribe: "Medios de Pago",
        Description: "Squad responsable de la pasarela de pagos, conciliación y fraude",
        CreatedAtUtc: DateTime.Parse("2025-11-01T08:00:00Z"),
        UpdatedAtUtc: DateTime.Parse("2026-06-15T10:15:00Z"));
}
