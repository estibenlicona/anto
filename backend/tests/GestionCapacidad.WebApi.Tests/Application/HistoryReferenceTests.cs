using GestionCapacidad.Application.Dedication;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class HistoryReferenceTests
{
    private static HistorySprintPoint Sealed(decimal points, bool isCurrent = false) =>
        new(points, SnapshotStatus.Sealed, isCurrent);

    [Fact]
    public void Median_WithEvenCount_AveragesTheTwoMiddleValues()
    {
        decimal? median = HistoryReference.Median([10m, 20m, 30m, 40m]);

        Assert.Equal(25m, median);
    }

    [Fact]
    public void Median_WithOddCount_ReturnsTheMiddleValue()
    {
        decimal? median = HistoryReference.Median([10m, 20m, 30m]);

        Assert.Equal(20m, median);
    }

    [Fact]
    public void Median_Empty_ReturnsNull()
    {
        Assert.Null(HistoryReference.Median([]));
    }

    [Fact]
    public void SealedSprints_ExcludesCurrentAndUnsealed()
    {
        List<HistorySprintPoint> sprints =
        [
            Sealed(20m),
            new(15m, SnapshotStatus.Missing, false),
            new(25m, SnapshotStatus.Provisional, true),
        ];

        IReadOnlyList<HistorySprintPoint> result = HistoryReference.SealedSprints(sprints, windowSprints: 6);

        Assert.Single(result);
        Assert.Equal(20m, result[0].CommittedPoints);
    }

    [Fact]
    public void SealedSprints_TrimsToTheWindow_KeepingTheMostRecent()
    {
        List<HistorySprintPoint> sprints = [Sealed(1m), Sealed(2m), Sealed(3m), Sealed(4m)];

        IReadOnlyList<HistorySprintPoint> result = HistoryReference.SealedSprints(sprints, windowSprints: 2);

        Assert.Equal([3m, 4m], result.Select(s => s.CommittedPoints));
    }

    [Fact]
    public void BuildReference_InsufficientHistory_MarksNotSufficient()
    {
        List<HistorySprintPoint> sprints = [Sealed(20m), Sealed(22m)];

        ReferenceResult reference = HistoryReference.BuildReference(
            sprints, currentPoints: 20m, windowSprints: 6, minSprints: 3, squadSprints: null, squadCurrentPoints: null);

        Assert.False(reference.Sufficient);
        Assert.Equal(2, reference.SealedSprintCount);
    }

    [Fact]
    public void BuildReference_ThreeComparableFigures_MatchesTheSpecScenario()
    {
        List<HistorySprintPoint> own = [Sealed(22m), Sealed(22m), Sealed(22m)];
        List<HistorySprintPoint> squad = [Sealed(21m), Sealed(21m), Sealed(21m)];

        ReferenceResult reference = HistoryReference.BuildReference(
            own, currentPoints: 28m, windowSprints: 6, minSprints: 3, squadSprints: squad, squadCurrentPoints: 21m);

        Assert.Equal(22m, reference.OwnMedian);
        Assert.Equal(21m, reference.SquadMedian);
        Assert.Equal(6m, reference.OwnDeviationPoints);
        Assert.Equal(27.3m, reference.OwnDeviationRate);
    }

    [Fact]
    public void BuildReference_SquadMedianIsPerCollaborator_NotRawSum()
    {
        // La mediana de célula ya viene agregada por colaborador (design.md decisión 5):
        // acá sólo se verifica que HistoryReference no la vuelva a sumar ni a promediar distinto.
        List<HistorySprintPoint> own = [Sealed(9m), Sealed(9m), Sealed(9m)];
        List<HistorySprintPoint> squad = [Sealed(9m), Sealed(9m), Sealed(9m)];

        ReferenceResult reference = HistoryReference.BuildReference(
            own, currentPoints: 9m, windowSprints: 6, minSprints: 3, squadSprints: squad, squadCurrentPoints: 9m);

        Assert.Equal(9m, reference.SquadMedian);
        Assert.Equal(0m, reference.SquadDeviationRate);
    }
}
