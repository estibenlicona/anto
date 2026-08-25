namespace GestionCapacidad.Application.UseCases.Allocations.CreateAllocation;

public sealed record CreateAllocationRequest(
    Guid PersonId,
    Guid SquadId,
    Guid? InitiativeId,
    int DedicationPercentage,
    int BauPercentage,
    int TransformationPercentage);
