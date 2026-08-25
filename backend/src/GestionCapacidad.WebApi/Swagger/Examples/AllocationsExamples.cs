using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Allocations.CreateAllocation;
using GestionCapacidad.Application.UseCases.Allocations.UpdateAllocation;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Swagger.Examples;

public sealed class AllocationDtoExample : IExamplesProvider<AllocationDto>
{
    public AllocationDto GetExamples() => new(
        Id: Guid.Parse("b1a1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c4d"),
        PersonId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        PersonName: "Ana María Rodríguez",
        SquadId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        SquadName: "Squad Pagos",
        InitiativeId: Guid.Parse("33333333-3333-3333-3333-333333333333"),
        InitiativeName: "Migración pasarela de pagos",
        DedicationPercentage: 100,
        BauPercentage: 30,
        TransformationPercentage: 70,
        CreatedAtUtc: DateTime.Parse("2026-01-15T13:30:00Z"),
        UpdatedAtUtc: null);
}

public sealed class CreateAllocationRequestExample : IExamplesProvider<CreateAllocationRequest>
{
    public CreateAllocationRequest GetExamples() => new(
        PersonId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
        SquadId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        InitiativeId: Guid.Parse("33333333-3333-3333-3333-333333333333"),
        DedicationPercentage: 100,
        BauPercentage: 30,
        TransformationPercentage: 70);
}

public sealed class CreateAllocationResponseExample : IExamplesProvider<CreateAllocationResponse>
{
    public CreateAllocationResponse GetExamples() => new(new AllocationDtoExample().GetExamples());
}

public sealed class UpdateAllocationRequestExample : IExamplesProvider<UpdateAllocationRequest>
{
    public UpdateAllocationRequest GetExamples() => new(
        Id: Guid.Parse("b1a1c2d3-e4f5-4a6b-8c7d-9e0f1a2b3c4d"),
        InitiativeId: Guid.Parse("33333333-3333-3333-3333-333333333333"),
        DedicationPercentage: 80,
        BauPercentage: 20,
        TransformationPercentage: 60);
}

public sealed class UpdateAllocationResponseExample : IExamplesProvider<UpdateAllocationResponse>
{
    public UpdateAllocationResponse GetExamples() => new(new AllocationDtoExample().GetExamples());
}
