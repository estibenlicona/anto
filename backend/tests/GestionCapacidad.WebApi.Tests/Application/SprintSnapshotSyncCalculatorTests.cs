using GestionCapacidad.Application.Dedication;
using GestionCapacidad.Application.ExternalServices.AzureDevOps;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.WebApi.Tests.Application;

public sealed class SprintSnapshotSyncCalculatorTests
{
    private static readonly DateOnly SprintStart = new(2026, 8, 17);
    private static readonly DateOnly SprintEnd = new(2026, 8, 30);

    private static RawWorkItemDto WorkItem(
        string id, decimal points, DateOnly addedAt, string? epicId = null,
        IReadOnlyList<RawWorkItemTransitionDto>? transitions = null) => new(
        id, int.Parse(id), $"HU {id}", null, epicId, epicId is null ? null : $"Épica {epicId}",
        null, null, points, "Active", addedAt, "Board 1", $"https://devops.example/{id}",
        transitions ?? []);

    [Fact]
    public void Compute_OneWorkItemActiveTheWholeSprint_WipIsOne()
    {
        var raw = new AzureDevOpsSyncDataDto(
            [
                WorkItem("101", 3m, SprintStart, transitions:
                [
                    new RawWorkItemTransitionDto(SprintStart.ToDateTime(TimeOnly.MinValue), "Active"),
                ]),
            ],
            []);

        SprintSnapshotSyncResult result = SprintSnapshotSyncCalculator.Compute(raw, SprintStart);

        Assert.Equal(1, result.Wip);
    }

    [Fact]
    public void Compute_TwoOverlappingWorkItems_WipIsTwo()
    {
        DateTime day1 = SprintStart.ToDateTime(TimeOnly.MinValue);
        DateTime day2 = SprintStart.AddDays(1).ToDateTime(TimeOnly.MinValue);
        DateTime day5 = SprintStart.AddDays(5).ToDateTime(TimeOnly.MinValue);

        var raw = new AzureDevOpsSyncDataDto(
            [
                WorkItem("101", 3m, SprintStart, transitions:
                [
                    new RawWorkItemTransitionDto(day1, "Active"),
                    new RawWorkItemTransitionDto(day5, "Done"),
                ]),
                WorkItem("102", 2m, SprintStart, transitions:
                [
                    new RawWorkItemTransitionDto(day2, "Active"),
                ]),
            ],
            []);

        SprintSnapshotSyncResult result = SprintSnapshotSyncCalculator.Compute(raw, SprintStart);

        Assert.Equal(2, result.Wip);
    }

    [Fact]
    public void Compute_OneWorkItemWithoutHistory_DoesNotInvalidateTheRest()
    {
        var raw = new AzureDevOpsSyncDataDto(
            [
                WorkItem("101", 3m, SprintStart, transitions:
                [
                    new RawWorkItemTransitionDto(SprintStart.ToDateTime(TimeOnly.MinValue), "Active"),
                ]),
                WorkItem("102", 2m, SprintStart), // sin transiciones
            ],
            []);

        SprintSnapshotSyncResult result = SprintSnapshotSyncCalculator.Compute(raw, SprintStart);

        Assert.Equal(1, result.Wip);
    }

    [Fact]
    public void Compute_NoWorkItemHasHistory_WipIsNull()
    {
        var raw = new AzureDevOpsSyncDataDto(
            [
                WorkItem("101", 3m, SprintStart),
                WorkItem("102", 2m, SprintStart),
            ],
            []);

        SprintSnapshotSyncResult result = SprintSnapshotSyncCalculator.Compute(raw, SprintStart);

        Assert.Null(result.Wip);
    }

    [Fact]
    public void Compute_SplitsCommittedAtStartFromAddedDuring_ByAddedDate()
    {
        var raw = new AzureDevOpsSyncDataDto(
            [
                WorkItem("101", 5m, SprintStart),
                WorkItem("102", 3m, SprintStart.AddDays(3)),
            ],
            []);

        SprintSnapshotSyncResult result = SprintSnapshotSyncCalculator.Compute(raw, SprintStart);

        Assert.Equal(5m, result.CommittedAtStartPoints);
        Assert.Equal(3m, result.AddedDuringSprintPoints);
        Assert.False(result.WorkItems.Single(w => w.WorkItemId == "101").AddedAfterSprintStart);
        Assert.True(result.WorkItems.Single(w => w.WorkItemId == "102").AddedAfterSprintStart);
    }

    [Fact]
    public void Compute_TwoWorkItemsSameEpic_GroupIntoOneConcurrentInitiative()
    {
        var raw = new AzureDevOpsSyncDataDto(
            [
                WorkItem("101", 3m, SprintStart, epicId: "E1"),
                WorkItem("102", 2m, SprintStart, epicId: "E1"),
            ],
            []);

        SprintSnapshotSyncResult result = SprintSnapshotSyncCalculator.Compute(raw, SprintStart);

        ConcurrentInitiativeSnapshot initiative = Assert.Single(result.Initiatives);
        Assert.Equal("E1", initiative.EpicId);
        Assert.Equal(5m, initiative.Points);
    }
}
