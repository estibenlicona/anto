using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Mappings;

public static class InitiativeMappings
{
    /// <summary>
    /// El nombre de la célula y <c>squadHasOtherActive</c> se derivan del
    /// conjunto y por eso llegan de afuera: la iniciativa sola no puede
    /// responder si su célula tiene otra activa.
    /// </summary>
    public static InitiativeDto ToDto(Initiative initiative, string squadName, bool squadHasOtherActive) =>
        new(initiative.Id,
            initiative.Name,
            initiative.SquadId,
            squadName,
            initiative.ProductOwner,
            initiative.TargetMonths,
            initiative.Status.Value,
            initiative.Evaluation is null ? null : ToDto(initiative.Evaluation),
            initiative.CreatedAtUtc,
            squadHasOtherActive);

    public static InitiativeEvaluationDto ToDto(InitiativeEvaluation evaluation) =>
        new([.. evaluation.Triage],
            evaluation.Answers.ToDictionary(pair => pair.Key, pair => pair.Value),
            evaluation.TargetMonths,
            evaluation.Points,
            evaluation.MaxPoints,
            evaluation.Pct,
            evaluation.Talla,
            evaluation.PmMin,
            evaluation.PmMax,
            evaluation.FteExpected,
            evaluation.FteMin,
            evaluation.FteMax,
            [.. evaluation.Dimensions.Select(d => new DimensionResultDto(
                d.Dimension, d.Answered, d.Total, d.Points, d.MaxPoints, d.Pct, d.WeightPct))],
            [.. evaluation.Mix.Select(m => new MixResultDto(
                m.Capability, m.People, m.CompositionPct, m.Fte))],
            evaluation.TriageVerdict.Value,
            evaluation.SavedAtUtc);
}
