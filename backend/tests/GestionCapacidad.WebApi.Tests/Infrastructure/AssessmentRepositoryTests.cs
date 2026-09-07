using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class AssessmentRepositoryTests
{
    private static readonly Guid PersonId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid SkillId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    [Fact]
    public async Task SavesAndReadsBackAClosedAssessmentWithAFrozenSkill()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new AssessmentRepository(dbContext);

        var assessment = new Assessment(PersonId, "2026-S1");
        assessment.SaveSkill(SkillId, 2, [["A"], ["B"], [], []], "nota con brecha", expectedLevel: 3);
        var frozen = new Dictionary<Guid, (string, string, IReadOnlyList<IReadOnlyList<string>>, int?)>
        {
            [SkillId] = ("SQL", "technical", [["A"], ["B", "C"], [], []], 3),
        };
        assessment.Close(frozen, catalogVersion: 4, DateTime.UtcNow);
        await repository.AddAsync(assessment);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        Assessment? saved = await new AssessmentRepository(reader).GetByIdAsync(assessment.Id);

        Assert.NotNull(saved);
        Assert.Equal(AssessmentStatus.Closed, saved.Status);
        Assert.Equal(4, saved.CatalogVersionAtClose);
        AssessmentSkillAnswer answer = Assert.Single(saved.Skills);
        Assert.Equal(2, answer.Level);
        Assert.Equal("SQL", answer.FrozenSkillName);
        Assert.Equal(["B", "C"], answer.FrozenLevels![1]);
        Assert.Equal("nota con brecha", answer.Note);
    }

    [Fact]
    public async Task GetByPersonAndCycle_ReturnsOnlyThatPersonAndCycle()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new AssessmentRepository(dbContext);

        await repository.AddAsync(new Assessment(PersonId, "2026-S1"));
        await repository.AddAsync(new Assessment(PersonId, "2025-S2"));
        await repository.AddAsync(new Assessment(Guid.NewGuid(), "2026-S1"));
        await new UnitOfWork(dbContext).SaveChangesAsync();

        IReadOnlyList<Assessment> found = await repository.GetByPersonAndCycleAsync(PersonId, "2026-S1");

        Assert.Single(found);
    }

    [Fact]
    public async Task ExistsUsingClosedSkill_TrueOnlyWhenAClosedAssessmentScoredIt()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new AssessmentRepository(dbContext);

        var inProgress = new Assessment(PersonId, "2026-S1");
        inProgress.SaveSkill(SkillId, 2, [], "", expectedLevel: null);
        await repository.AddAsync(inProgress);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        Assert.False(await repository.ExistsUsingClosedSkillAsync(SkillId));

        var closed = new Assessment(Guid.NewGuid(), "2026-S1");
        closed.SaveSkill(SkillId, 3, [], "", expectedLevel: null);
        closed.Close(
            new Dictionary<Guid, (string, string, IReadOnlyList<IReadOnlyList<string>>, int?)>
            {
                [SkillId] = ("SQL", "technical", [[], [], [], []], null),
            },
            1, DateTime.UtcNow);
        await repository.AddAsync(closed);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        Assert.True(await repository.ExistsUsingClosedSkillAsync(SkillId));
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
