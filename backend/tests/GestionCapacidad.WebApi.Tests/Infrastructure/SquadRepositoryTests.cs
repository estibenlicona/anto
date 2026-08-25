using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class SquadRepositoryTests
{
    // ── Save & Query ──────────────────────────────────────────────────────────

    [Fact]
    public async Task Repository_SavesAndQueriesASquad()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SquadRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Squad squad = TestDataFactory.CreateSquad(name: "Backend Platform", criticality: Criticality.Critical);

        await repository.AddAsync(squad);
        await unitOfWork.SaveChangesAsync();

        Squad? saved = await repository.GetByIdAsync(squad.Id);

        Assert.NotNull(saved);
        Assert.Equal("Backend Platform", saved.Name);
        Assert.Equal(Criticality.Critical, saved.Criticality);
    }

    [Fact]
    public async Task Repository_PersistsCriticality_AsString()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SquadRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Squad squad = TestDataFactory.CreateSquad(criticality: Criticality.High);

        await repository.AddAsync(squad);
        await unitOfWork.SaveChangesAsync();

        // Verifica que el Value Converter funciona: lee desde BD y reconstruye el VO
        Squad? saved = await repository.GetByIdAsync(squad.Id);

        Assert.NotNull(saved);
        Assert.Equal(Criticality.High, saved.Criticality);
        Assert.Equal("High", saved.Criticality.Value);
    }

    // ── ExistsByName ──────────────────────────────────────────────────────────

    [Fact]
    public async Task ExistsByNameAsync_ReturnsTrue_WhenNameExists()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SquadRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Squad squad = TestDataFactory.CreateSquad(name: "Payments Platform");

        await repository.AddAsync(squad);
        await unitOfWork.SaveChangesAsync();

        bool exists = await repository.ExistsByNameAsync("Payments Platform");

        Assert.True(exists);
    }

    [Fact]
    public async Task ExistsByNameAsync_ReturnsFalse_WhenNameDoesNotExist()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SquadRepository(dbContext);

        bool exists = await repository.ExistsByNameAsync("NonExistent");

        Assert.False(exists);
    }

    // ── GetAll ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_ReturnsAllSquads()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SquadRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);

        await repository.AddAsync(TestDataFactory.CreateSquad(name: "Alpha"));
        await repository.AddAsync(TestDataFactory.CreateSquad(name: "Beta"));
        await unitOfWork.SaveChangesAsync();

        IReadOnlyList<Squad> squads = await repository.GetAllAsync();

        Assert.Equal(2, squads.Count);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_RemovesSquad()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SquadRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Squad squad = TestDataFactory.CreateSquad();

        await repository.AddAsync(squad);
        await unitOfWork.SaveChangesAsync();

        repository.Delete(squad);
        await unitOfWork.SaveChangesAsync();

        Squad? deleted = await repository.GetByIdAsync(squad.Id);
        Assert.Null(deleted);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

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
