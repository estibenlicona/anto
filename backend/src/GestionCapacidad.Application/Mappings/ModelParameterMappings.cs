using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

/// <summary>
/// Agregados de parámetros del modelo → DTOs del contrato. Las colecciones
/// salen ordenadas por <c>Position</c>: la pantalla guarda un orden y espera
/// recibir el mismo.
/// </summary>
public static class ModelParameterMappings
{
    public static SprintConfigDto ToDto(SprintConfiguration config) => new(
        config.Weeks,
        config.SprintsPerQuarter,
        config.HoursPerSprint,
        config.SprintCloseTime,
        config.HistoryWindowSprints,
        config.MinHistorySprints);

    public static TallaBandsDto ToDto(TallaBandSet bands) => new(
        [.. bands.Boundaries],
        [.. bands.Bands.OrderBy(b => b.Position).Select(ToDto)]);

    public static TallaBandDto ToDto(TallaBand band) => new(
        band.Talla,
        band.PmMin,
        band.PmMax,
        band.Lectura);

    public static IReadOnlyList<CapabilityMixRowDto> ToDto(CapabilityMix mix) =>
        [.. mix.Rows.OrderBy(r => r.Position).Select(ToDto)];

    public static CapabilityMixRowDto ToDto(CapabilityMixRow row) => new(
        row.Key,
        row.Capacidad,
        row.PorTalla.ToDictionary(pair => pair.Key, pair => pair.Value));

    public static IReadOnlyList<QuestionPoolRowDto> ToDto(QuestionPool pool) =>
        [.. pool.Questions.OrderBy(q => q.Position).Select(ToDto)];

    public static QuestionPoolRowDto ToDto(PoolQuestion question) => new(
        question.Code,
        question.Dimension.Value,
        question.Texto,
        question.Peso);
}
