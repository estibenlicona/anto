using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class ExpertiseLineRepositoryTests
{
    [Fact]
    public async Task SavesAndReadsBackALineWithItsLead()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new ExpertiseLineRepository(dbContext);

        var line = new ExpertiseLine("Backend", "be", "Descripción de la línea");
        Guid leadId = Guid.NewGuid();
        line.SetLead(leadId);
        await repository.AddAsync(line);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        ExpertiseLine? saved = await new ExpertiseLineRepository(reader).GetByIdAsync(line.Id);

        Assert.NotNull(saved);
        Assert.Equal("BE", saved.Code);
        Assert.Equal(leadId, saved.LeadId);
        Assert.Equal(ExpertiseLineStatus.Active, saved.Status);
    }

    [Fact]
    public async Task ExistsByCodeAsync_MatchesAcrossActiveAndArchived()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new ExpertiseLineRepository(dbContext);

        var archived = new ExpertiseLine("Backend Viejo", "BE", null);
        archived.Archive();
        await repository.AddAsync(archived);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        Assert.True(await repository.ExistsByCodeAsync("be"));
        Assert.False(await repository.ExistsByNameAsync("Backend Viejo"));
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
