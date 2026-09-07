using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class SkillRepositoryTests
{
    [Fact]
    public async Task SavesAndReadsBackASkillWithItsFourLevelsAndExpectations()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SkillRepository(dbContext);

        var skill = new Skill("SQL", SkillGroup.Technical, "Consultas y modelado relacional");
        skill.ReplaceCriteria(2, ["Escribe joins simples", "Normaliza tablas"]);
        skill.SetExpectation("Data Engineer", 3);
        skill.SetExpectation("Backend Dev", 2);
        await repository.AddAsync(skill);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        Skill? saved = await new SkillRepository(reader).GetByIdAsync(skill.Id);

        Assert.NotNull(saved);
        Assert.Equal("SQL", saved.Name);
        Assert.Equal(4, saved.Levels.Count);
        Assert.Equal(["Escribe joins simples", "Normaliza tablas"], saved.Levels.Single(l => l.Level.Value == 2).Criteria);
        Assert.Equal(2, saved.Expectations.Count);
        Assert.Equal(3, saved.Expectations.Single(e => e.Position == "Data Engineer").Level.Value);
    }

    [Fact]
    public async Task ExistsByName_IsCaseAndWhitespaceInsensitive()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SkillRepository(dbContext);
        await repository.AddAsync(new Skill("SQL", SkillGroup.Technical, "d"));
        await new UnitOfWork(dbContext).SaveChangesAsync();

        Assert.True(await repository.ExistsByNameAsync("  sql  "));
        Assert.False(await repository.ExistsByNameAsync("Python"));
    }

    [Fact]
    public async Task ExistsByName_ExcludesTheGivenId()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SkillRepository(dbContext);
        var skill = new Skill("SQL", SkillGroup.Technical, "d");
        await repository.AddAsync(skill);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        Assert.False(await repository.ExistsByNameAsync("SQL", excludeId: skill.Id));
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
