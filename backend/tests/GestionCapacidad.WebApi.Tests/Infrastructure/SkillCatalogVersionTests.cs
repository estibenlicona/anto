using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class SkillCatalogVersionTests
{
    [Fact]
    public async Task GetAsync_WithoutAnyRowYet_ReturnsNull_AndDoesNotThrow()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SingleDocumentRepository<SkillCatalogVersion>(dbContext);

        SkillCatalogVersion? version = await repository.GetAsync();

        Assert.Null(version);
    }

    [Fact]
    public async Task AddThenIncrement_PersistsTheNewValue()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SingleDocumentRepository<SkillCatalogVersion>(dbContext);

        var version = new SkillCatalogVersion();
        version.Increment();
        await repository.AddAsync(version);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        SkillCatalogVersion? saved = await new SingleDocumentRepository<SkillCatalogVersion>(reader).GetAsync();

        Assert.NotNull(saved);
        Assert.Equal(2, saved.Value);
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
