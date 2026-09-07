using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.Dedication;

/// <summary>Lo mínimo que la referencia necesita de un sprint.</summary>
public sealed record HistorySprintPoint(decimal CommittedPoints, SnapshotStatus Status, bool IsCurrent);

public sealed record ReferenceResult(
    decimal? OwnMedian,
    decimal? SquadMedian,
    int SealedSprintCount,
    bool Sufficient,
    decimal? OwnDeviationPoints,
    decimal? OwnDeviationRate,
    decimal? SquadDeviationRate);

/// <summary>
/// Contra qué se compara la demanda de un colaborador. Puerto literal de
/// <c>history.ts</c>: la referencia principal es su propio histórico, la de
/// la célula es contexto y nunca sustituto — ver design.md sobre cómo se
/// agrega la mediana de célula.
/// </summary>
public static class HistoryReference
{
    /// <summary>
    /// Mediana, no promedio: un sprint atípico no debe arrastrar la
    /// referencia. En longitud par, promedio de los dos centrales.
    /// </summary>
    public static decimal? Median(IReadOnlyList<decimal> values)
    {
        if (values.Count == 0)
        {
            return null;
        }

        List<decimal> sorted = [.. values.OrderBy(v => v)];
        int mid = sorted.Count / 2;
        decimal raw = sorted.Count % 2 == 0 ? (sorted[mid - 1] + sorted[mid]) / 2m : sorted[mid];
        return Math.Round(raw, 1, MidpointRounding.AwayFromZero);
    }

    /// <summary>Los sprints que pueden alimentar el histórico: sellados, ya cerrados, recortados a la ventana.</summary>
    public static IReadOnlyList<HistorySprintPoint> SealedSprints(
        IReadOnlyList<HistorySprintPoint> sprints, int windowSprints)
    {
        List<HistorySprintPoint> sealedOnes =
        [
            .. sprints.Where(s => !s.IsCurrent && s.Status == SnapshotStatus.Sealed),
        ];

        return sealedOnes.Count <= windowSprints ? sealedOnes : [.. sealedOnes.TakeLast(windowSprints)];
    }

    private static decimal? DeviationRate(decimal current, decimal? reference)
    {
        if (reference is null || reference == 0m)
        {
            return null;
        }

        return Math.Round(((current - reference.Value) / reference.Value) * 100m, 1, MidpointRounding.AwayFromZero);
    }

    public static ReferenceResult BuildReference(
        IReadOnlyList<HistorySprintPoint> sprints,
        decimal currentPoints,
        int windowSprints,
        int minSprints,
        IReadOnlyList<HistorySprintPoint>? squadSprints,
        decimal? squadCurrentPoints)
    {
        IReadOnlyList<HistorySprintPoint> own = SealedSprints(sprints, windowSprints);
        decimal? ownMedian = Median([.. own.Select(s => s.CommittedPoints)]);
        int sealedSprintCount = own.Count;
        bool sufficient = sealedSprintCount >= minSprints;

        decimal? squadMedian = squadSprints is null
            ? null
            : Median([.. SealedSprints(squadSprints, windowSprints).Select(s => s.CommittedPoints)]);

        return new ReferenceResult(
            ownMedian,
            squadMedian,
            sealedSprintCount,
            sufficient,
            ownMedian is null ? null : Math.Round(currentPoints - ownMedian.Value, 1, MidpointRounding.AwayFromZero),
            DeviationRate(currentPoints, ownMedian),
            squadCurrentPoints is null ? null : DeviationRate(squadCurrentPoints.Value, squadMedian));
    }
}
