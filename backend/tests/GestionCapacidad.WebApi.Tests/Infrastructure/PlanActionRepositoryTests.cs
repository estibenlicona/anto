using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class PlanActionRepositoryTests
{
    private static readonly Guid PersonId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid SkillId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    [Fact]
    public async Task SavesAndReadsBackAnActionWithTheSameStatusAndLevels()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PlanActionRepository(dbContext);

        var action = new PlanAction(PersonId, SkillId, 1, 3, "2026-12", "Curso de SQL avanzado");
        action.SetStatus(PlanActionStatus.Done);
        await repository.AddAsync(action);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        IReadOnlyList<PlanAction> found = await new PlanActionRepository(reader).GetByPersonAsync(PersonId);

        PlanAction saved = Assert.Single(found);
        Assert.Equal(PlanActionStatus.Done, saved.Status);
        Assert.Equal(1, saved.FromLevel);
        Assert.Equal(3, saved.TargetLevel);
        Assert.Equal("2026-12", saved.DueMonth);
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
