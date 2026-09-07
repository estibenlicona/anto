using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.Admin.SaveTallaBands;

/// <summary>
/// El cuerpo del <c>PUT /admin/talla-bands</c>: los cuatro cortes interiores
/// y las cinco bandas, en el orden en que deben quedar guardadas.
/// </summary>
public sealed record SaveTallaBandsRequest(
    IReadOnlyList<decimal> Boundaries,
    IReadOnlyList<TallaBandDto> Bands);
