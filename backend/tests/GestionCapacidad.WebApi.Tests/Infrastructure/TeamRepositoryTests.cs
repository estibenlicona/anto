using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class TeamRepositoryTests
{
    // ── Save & Query ──────────────────────────────────────────────────────────

    [Fact]
    public async Task Repository_SavesAndQueriesATeam()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new TeamRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Team team = TestDataFactory.CreateTeam(name: "Ecosistema Digital");

        await repository.AddAsync(team);
        await unitOfWork.SaveChangesAsync();

        Team? saved = await repository.GetByIdAsync(team.Id);

        Assert.NotNull(saved);
        Assert.Equal("Ecosistema Digital", saved.Name);
    }

    // ── ExistsByName ──────────────────────────────────────────────────────────

    [Fact]
    public async Task ExistsByNameAsync_ReturnsTrue_WhenNameExists()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new TeamRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Team team = TestDataFactory.CreateTeam(name: "Riesgo y Fraude");

        await repository.AddAsync(team);
        await unitOfWork.SaveChangesAsync();

        bool exists = await repository.ExistsByNameAsync("Riesgo y Fraude");

        Assert.True(exists);
    }

    [Fact]
    public async Task ExistsByNameAsync_ReturnsFalse_WhenNameDoesNotExist()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new TeamRepository(dbContext);

        bool exists = await repository.ExistsByNameAsync("NonExistent");

        Assert.False(exists);
    }

    [Fact]
    public async Task ExistsByNameAsync_ExcludesGivenId()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new TeamRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Team team = TestDataFactory.CreateTeam(name: "Pagos");

        await repository.AddAsync(team);
        await unitOfWork.SaveChangesAsync();

        bool exists = await repository.ExistsByNameAsync("Pagos", excludeId: team.Id);

        Assert.False(exists);
    }

    // ── GetPaged ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetPagedAsync_FiltersBySearchTerm()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new TeamRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);

        await repository.AddAsync(TestDataFactory.CreateTeam(name: "Datos y Analítica"));
        await repository.AddAsync(TestDataFactory.CreateTeam(name: "Pagos"));
        await unitOfWork.SaveChangesAsync();

        (IReadOnlyList<Team> items, int totalCount) = await repository.GetPagedAsync(1, 10, search: "datos");

        Assert.Equal(1, totalCount);
        Assert.Equal("Datos y Analítica", Assert.Single(items).Name);
    }

    // ── GetAll ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAllAsync_ReturnsAllTeams()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new TeamRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);

        await repository.AddAsync(TestDataFactory.CreateTeam(name: "Alpha"));
        await repository.AddAsync(TestDataFactory.CreateTeam(name: "Beta"));
        await unitOfWork.SaveChangesAsync();

        IReadOnlyList<Team> teams = await repository.GetAllAsync();

        Assert.Equal(2, teams.Count);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_RemovesTeam()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new TeamRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Team team = TestDataFactory.CreateTeam();

        await repository.AddAsync(team);
        await unitOfWork.SaveChangesAsync();

        repository.Delete(team);
        await unitOfWork.SaveChangesAsync();

        Team? deleted = await repository.GetByIdAsync(team.Id);
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
