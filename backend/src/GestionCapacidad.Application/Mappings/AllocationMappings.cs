using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Allocations.CreateAllocation;
using GestionCapacidad.Application.UseCases.Allocations.UpdateAllocation;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

public static class AllocationMappings
{
    public static AllocationDto ToDto(Allocation allocation, string personName = "", string squadName = "", string? initiativeName = null) =>
        new(allocation.Id,
            allocation.PersonId,
            personName,
            allocation.SquadId,
            squadName,
            allocation.InitiativeId,
            initiativeName,
            allocation.DedicationPercentage.Value,
            allocation.BauPercentage.Value,
            allocation.TransformationPercentage.Value,
            allocation.CreatedAtUtc,
            allocation.UpdatedAtUtc);

    public static CreateAllocationResponse ToCreateResponse(Allocation a, string personName, string squadName) =>
        new(ToDto(a, personName, squadName));

    public static UpdateAllocationResponse ToUpdateResponse(Allocation a, string personName, string squadName) =>
        new(ToDto(a, personName, squadName));
}
