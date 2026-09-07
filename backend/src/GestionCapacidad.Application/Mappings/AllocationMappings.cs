using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Allocations.CreateAllocation;
using GestionCapacidad.Application.UseCases.Allocations.UpdateAllocation;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

public static class AllocationMappings
{
    public static AllocationDto ToDto(
        Allocation allocation,
        Person? person,
        string squadName = "",
        string? initiativeName = null) =>
        new(allocation.Id,
            allocation.PersonId,
            person?.Name ?? string.Empty,
            allocation.SquadId,
            squadName,
            allocation.InitiativeId,
            initiativeName,
            allocation.DedicationPercentage.Value,
            allocation.BauPercentage.Value,
            allocation.TransformationPercentage.Value,
            allocation.CreatedAtUtc,
            allocation.UpdatedAtUtc,
            person?.Position ?? string.Empty,
            person?.Modality.Value ?? string.Empty,
            person?.Level.Value ?? 0,
            person?.Level.Label ?? string.Empty,
            Math.Max(0, 100 - allocation.DedicationPercentage.Value));

    public static CreateAllocationResponse ToCreateResponse(Allocation a, Person person, string squadName) =>
        new(ToDto(a, person, squadName));

    public static UpdateAllocationResponse ToUpdateResponse(Allocation a, Person? person, string squadName) =>
        new(ToDto(a, person, squadName));
}
