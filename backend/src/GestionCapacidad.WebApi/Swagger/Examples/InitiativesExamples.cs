using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Initiatives.ChangeInitiativeStatus;
using GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;
using GestionCapacidad.Application.UseCases.Initiatives.UpdateInitiative;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

public sealed class InitiativeDtoExample : IExamplesProvider<InitiativeDto>
{
    public InitiativeDto GetExamples() => new(
        Id: Guid.Parse("33333333-3333-3333-3333-333333333333"),
        SquadId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        Name: "Migración pasarela de pagos",
        Type: "Transformation",
        Status: "InProgress",
        DeadlineMonths: 6,
        BacklogDefined: true,
        ArchitectureDefined: true,
        EarlyStageCompleted: false,
        CreatedAtUtc: DateTime.Parse("2026-02-01T08:00:00Z"),
        UpdatedAtUtc: null);
}

public sealed class CreateInitiativeRequestExample : IExamplesProvider<CreateInitiativeRequest>
{
    public CreateInitiativeRequest GetExamples() => new(
        SquadId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        Name: "Migración pasarela de pagos",
        Type: "Transformation",
        DeadlineMonths: 6);
}

public sealed class CreateInitiativeResponseExample : IExamplesProvider<CreateInitiativeResponse>
{
    public CreateInitiativeResponse GetExamples() => new(new InitiativeDtoExample().GetExamples());
}

public sealed class UpdateInitiativeRequestExample : IExamplesProvider<UpdateInitiativeRequest>
{
    public UpdateInitiativeRequest GetExamples() => new(
        Id: Guid.Parse("33333333-3333-3333-3333-333333333333"),
        Name: "Migración pasarela de pagos v2",
        Type: "Transformation",
        DeadlineMonths: 8);
}

public sealed class UpdateInitiativeResponseExample : IExamplesProvider<UpdateInitiativeResponse>
{
    public UpdateInitiativeResponse GetExamples() => new(new InitiativeDtoExample().GetExamples());
}

public sealed class ChangeInitiativeStatusRequestExample : IExamplesProvider<ChangeInitiativeStatusRequest>
{
    public ChangeInitiativeStatusRequest GetExamples() => new(
        Id: Guid.Parse("33333333-3333-3333-3333-333333333333"),
        SquadId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        Status: "Completed");
}
