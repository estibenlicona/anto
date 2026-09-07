namespace GestionCapacidad.Application.UseCases.Allocations.UpdateAllocation;

/// <summary>
/// Cuerpo del contrato: sólo los porcentajes. El <c>Id</c> viaja en la ruta;
/// la iniciativa no se toca desde acá.
/// </summary>
public sealed record UpdateAllocationRequest(
    Guid Id,
    int DedicationPercentage,
    int BauPercentage,
    int TransformationPercentage);
