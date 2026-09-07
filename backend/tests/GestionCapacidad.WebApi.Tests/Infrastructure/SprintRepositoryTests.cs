using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class SprintRepositoryTests
{
    [Fact]
    public async Task SavesAndReadsBackASprintByName()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SprintRepository(dbContext);

        var sprint = new Sprint("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), 0);
        await repository.AddAsync(sprint);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        Sprint? found = await new SprintRepository(reader).GetByNameAsync("S18");

        Assert.NotNull(found);
        Assert.Equal(sprint.Id, found.Id);
        Assert.Equal(new DateOnly(2026, 8, 17), found.StartDate);
    }

    [Fact]
    public async Task GetAllAsync_OrdersByStartDateAscending()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SprintRepository(dbContext);

        await repository.AddAsync(new Sprint("S18", new DateOnly(2026, 8, 17), new DateOnly(2026, 8, 30), 0));
        await repository.AddAsync(new Sprint("S17", new DateOnly(2026, 8, 3), new DateOnly(2026, 8, 16), 0));
        await new UnitOfWork(dbContext).SaveChangesAsync();

        IReadOnlyList<Sprint> all = await repository.GetAllAsync();

        Assert.Equal(["S17", "S18"], all.Select(s => s.Name));
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
