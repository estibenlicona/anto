namespace GestionCapacidad.Application.UseCases.Allocations.UpdateAllocation;

public sealed record UpdateAllocationRequest(
    Guid Id,
    Guid? InitiativeId,
    int DedicationPercentage,
    int BauPercentage,
    int TransformationPercentage);
