using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.WebApi.Tests.Domain;

public sealed class SprintSnapshotTests
{
    private static readonly Guid PersonId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid SprintId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    [Fact]
    public void Ctor_NacesProvisional_WithoutExecution()
    {
        var snapshot = new SprintSnapshot(PersonId, SprintId);

        Assert.Equal(SnapshotStatus.Provisional, snapshot.Status);
        Assert.Equal(0m, snapshot.CommittedPoints);
        Assert.Null(snapshot.SealedAtUtc);
    }

    [Fact]
    public void CommittedPoints_IsStartPlusAdded()
    {
        var snapshot = new SprintSnapshot(PersonId, SprintId);

        snapshot.SetExecution(22m, 8m, null, null, null, 0m);

        Assert.Equal(30m, snapshot.CommittedPoints);
    }

    [Fact]
    public void Seal_Twice_Throws()
    {
        var snapshot = new SprintSnapshot(PersonId, SprintId);
        snapshot.SetExecution(22m, 0m, 22m, 0m, 3, 0m);
        snapshot.Seal(DateTime.UtcNow);

        Assert.Throws<DomainException>(() => snapshot.Seal(DateTime.UtcNow));
    }

    [Fact]
    public void Seal_AMissingSnapshot_Throws()
    {
        var snapshot = new SprintSnapshot(PersonId, SprintId);
        snapshot.MarkMissing();

        Assert.Throws<DomainException>(() => snapshot.Seal(DateTime.UtcNow));
    }

    [Fact]
    public void MarkMissing_OnASealedSnapshot_Throws()
    {
        var snapshot = new SprintSnapshot(PersonId, SprintId);
        snapshot.SetExecution(22m, 0m, 22m, 0m, 3, 0m);
        snapshot.Seal(DateTime.UtcNow);

        Assert.Throws<DomainException>(() => snapshot.MarkMissing());
    }

    [Fact]
    public void SetExecution_AfterMarkedMissing_ReturnsToProvisional()
    {
        var snapshot = new SprintSnapshot(PersonId, SprintId);
        snapshot.MarkMissing();

        snapshot.SetExecution(10m, 0m, null, null, null, 0m);

        Assert.Equal(SnapshotStatus.Provisional, snapshot.Status);
    }

    [Fact]
    public void ModifyingASealedSnapshot_Throws()
    {
        var snapshot = new SprintSnapshot(PersonId, SprintId);
        snapshot.SetExecution(22m, 0m, 22m, 0m, 3, 0m);
        snapshot.Seal(DateTime.UtcNow);

        Assert.Throws<DomainException>(() => snapshot.SetExecution(0m, 0m, null, null, null, 0m));
        Assert.Throws<DomainException>(() => snapshot.ReplaceInitiatives([]));
        Assert.Throws<DomainException>(() => snapshot.ReplaceWorkItems([]));
        Assert.Throws<DomainException>(() => snapshot.ReplaceActivity([]));
    }
}
