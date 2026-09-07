using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.Admin.SaveCapabilityMix;

/// <summary>
/// El cuerpo del <c>PUT /admin/capability-mix</c>. El contrato manda un
/// arreglo desnudo; el endpoint lo envuelve acá porque FluentValidation
/// valida un objeto raíz.
/// </summary>
public sealed record SaveCapabilityMixRequest(IReadOnlyList<CapabilityMixRowDto> Rows);
