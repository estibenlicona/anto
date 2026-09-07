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
        SquadName: "Backend Platform",
        InitiativeId: null,
        InitiativeName: null,
        DedicationPercentage: 80,
        BauPercentage: 50,
        TransformationPercentage: 30,
        CreatedAtUtc: DateTime.Parse("2026-01-15T13:30:00Z"),
        UpdatedAtUtc: null,
        PersonPosition: "Backend Developer",
        PersonModality: "Hybrid",
        PersonLevel: 3,
        PersonLevelLabel: "Avanzado",
        PersonAvailablePercentage: 20);
}

public sealed class CreateAllocationRequestExample : IExamplesProvider<CreateAllocationRequest>
{
    public CreateAllocationRequest GetExamples() => new(
        SquadId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
        PersonId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
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
        DedicationPercentage: 80,
        BauPercentage: 20,
        TransformationPercentage: 60);
}

public sealed class UpdateAllocationResponseExample : IExamplesProvider<UpdateAllocationResponse>
{
    public UpdateAllocationResponse GetExamples() => new(new AllocationDtoExample().GetExamples());
}
