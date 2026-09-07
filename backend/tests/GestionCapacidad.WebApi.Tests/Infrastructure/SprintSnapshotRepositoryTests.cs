using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class SprintSnapshotRepositoryTests
{
    private static readonly Guid PersonId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid SprintId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    [Fact]
    public async Task SavesAndReadsBackASealedSnapshotWithItsThreeOwnedCollections()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SprintSnapshotRepository(dbContext);

        var snapshot = new SprintSnapshot(PersonId, SprintId);
        snapshot.SetExecution(20m, 2m, 18m, 3m, 4, 0.5m);
        snapshot.ReplaceInitiatives([new ConcurrentInitiativeSnapshot("E-1", "Épica 1", "I-1", "Iniciativa 1", 10m)]);
        snapshot.ReplaceWorkItems([new WorkItemSnapshot(
            "WI-1", 101, "Historia 1", WorkItemTag.Initiative, "E-1", "Épica 1", "I-1", "Iniciativa 1",
            5m, "Closed", false, "Board 1", "https://dev.azure.com/wi/101")]);
        snapshot.ReplaceActivity([new ActivityDaySnapshot(new DateOnly(2026, 8, 17), 3, 1, 2)]);
        snapshot.Seal(DateTime.UtcNow);

        await repository.AddAsync(snapshot);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        SprintSnapshot? found = await new SprintSnapshotRepository(reader)
            .GetByPersonAndSprintAsync(PersonId, SprintId);

        Assert.NotNull(found);
        Assert.Equal(SnapshotStatus.Sealed, found.Status);
        Assert.Equal(22m, found.CommittedPoints);
        ConcurrentInitiativeSnapshot initiative = Assert.Single(found.Initiatives);
        Assert.Equal("Épica 1", initiative.EpicTitle);
        WorkItemSnapshot workItem = Assert.Single(found.WorkItems);
        Assert.Equal(WorkItemTag.Initiative, workItem.Tag);
        ActivityDaySnapshot activity = Assert.Single(found.Activity);
        Assert.Equal(3, activity.Commits);
    }

    [Fact]
    public async Task GetByPersonIdsAsync_ReturnsOnlySnapshotsOfThoseIds()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SprintSnapshotRepository(dbContext);

        var other = Guid.NewGuid();
        await repository.AddAsync(new SprintSnapshot(PersonId, SprintId));
        await repository.AddAsync(new SprintSnapshot(other, SprintId));
        await new UnitOfWork(dbContext).SaveChangesAsync();

        IReadOnlyList<SprintSnapshot> found = await repository.GetByPersonIdsAsync([PersonId]);

        Assert.Single(found);
        Assert.Equal(PersonId, found[0].PersonId);
    }

    private static async Task<ApplicationDbContext> CreateDbContextAsync(SqliteConnection connection)
    {
        DbContextOptions<ApplicationDbContext> options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        var dbContext = new ApplicationDbContext(options);
        await dbContext.Database.EnsureCreatedAsync();
        return dbContext;
    }
}
