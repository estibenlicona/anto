namespace GestionCapacidad.Application.UseCases.Allocations.CreateAllocation;

/// <summary>
/// Cuerpo del contrato: persona + porcentajes. El <c>SquadId</c> viaja en la
/// ruta y se inyecta en el endpoint; la iniciativa nace nula (se gestiona en
/// su propio módulo).
/// </summary>
public sealed record CreateAllocationRequest(
    Guid SquadId,
    Guid PersonId,
    int DedicationPercentage,
    int BauPercentage,
    int TransformationPercentage);
