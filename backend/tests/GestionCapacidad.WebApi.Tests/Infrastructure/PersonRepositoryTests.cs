using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class PersonRepositoryTests
{
    // ── Save & Query ──────────────────────────────────────────────────────────

    [Fact]
    public async Task Repository_SavesAndQueriesAPerson()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PersonRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Person person = TestDataFactory.CreatePerson(name: "Carlos López", seniority: Seniority.Avanzado);

        await repository.AddAsync(person);
        await unitOfWork.SaveChangesAsync();

        Person? saved = await repository.GetByIdAsync(person.Id);

        Assert.NotNull(saved);
        Assert.Equal("Carlos López", saved.Name);
        Assert.Equal(Seniority.Avanzado, saved.Seniority);
    }

    [Fact]
    public async Task Repository_PersiststsAllValueObjects()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PersonRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Person person = TestDataFactory.CreatePerson(
            seniority: Seniority.Avanzado,
            modality: Modality.Remote);

        await repository.AddAsync(person);
        await unitOfWork.SaveChangesAsync();

        Person? saved = await repository.GetByIdAsync(person.Id);

        Assert.NotNull(saved);
        Assert.Equal(Seniority.Avanzado, saved.Seniority);
        Assert.Equal(Modality.Remote, saved.Modality);
        Assert.Equal(Fte.FullTime, saved.AvailableFte);
    }

    // ── ExistsByDocumentId ────────────────────────────────────────────────────

    [Fact]
    public async Task ExistsByDocumentIdAsync_ReturnsTrue_WhenExists()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PersonRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Person person = TestDataFactory.CreatePerson();

        await repository.AddAsync(person);
        await unitOfWork.SaveChangesAsync();

        bool exists = await repository.ExistsByDocumentIdAsync(person.DocumentId);
        Assert.True(exists);
    }

    [Fact]
    public async Task ExistsByDocumentIdAsync_ReturnsFalse_WhenNotExists()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PersonRepository(dbContext);

        bool exists = await repository.ExistsByDocumentIdAsync("nonexistent-doc");
        Assert.False(exists);
    }

    // ── ExistsByUpn ───────────────────────────────────────────────────────────

    [Fact]
    public async Task ExistsByUserPrincipalNameAsync_ReturnsTrue_WhenExists()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PersonRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Person person = TestDataFactory.CreatePerson();

        await repository.AddAsync(person);
        await unitOfWork.SaveChangesAsync();

        bool exists = await repository.ExistsByUserPrincipalNameAsync(person.UserPrincipalName);
        Assert.True(exists);
    }

    // ── GetByChapter ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GetByChapterAsync_ReturnsOnlyMatchingPeople()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PersonRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        var chapterId = Guid.NewGuid();

        Person p1 = TestDataFactory.CreatePerson(name: "Alice");
        Person p2 = TestDataFactory.CreatePerson(name: "Bob");
        Person p3 = TestDataFactory.CreatePerson(name: "Carol");
        p1.AssignToChapter(chapterId);
        p2.AssignToChapter(chapterId);

        await repository.AddAsync(p1);
        await repository.AddAsync(p2);
        await repository.AddAsync(p3);
        await unitOfWork.SaveChangesAsync();

        IReadOnlyList<Person> result = await repository.GetByChapterAsync(chapterId);

        Assert.Equal(2, result.Count);
        Assert.All(result, p => Assert.Equal(chapterId, p.ChapterId));
    }

    // ── GetPagedAsync — búsqueda y filtros ───────────────────────────────────────

    [Fact]
    public async Task GetPagedAsync_FiltersBySearch_MatchingName()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PersonRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);

        await repository.AddAsync(TestDataFactory.CreatePerson(name: "María González"));
        await repository.AddAsync(TestDataFactory.CreatePerson(name: "Carlos López"));
        await unitOfWork.SaveChangesAsync();

        (IReadOnlyList<Person> items, int totalCount) = await repository.GetPagedAsync(1, 10, search: "maría");

        Assert.Equal(1, totalCount);
        Assert.Equal("María González", Assert.Single(items).Name);
    }

    [Fact]
    public async Task GetPagedAsync_FiltersBySearch_MatchingPosition()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PersonRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);

        await repository.AddAsync(TestDataFactory.CreatePerson(name: "María González", position: "Backend Dev"));
        await repository.AddAsync(TestDataFactory.CreatePerson(name: "Carlos López", position: "QA Engineer"));
        await unitOfWork.SaveChangesAsync();

        (IReadOnlyList<Person> items, int totalCount) = await repository.GetPagedAsync(1, 10, search: "backend");

        Assert.Equal(1, totalCount);
        Assert.Equal("María González", Assert.Single(items).Name);
    }

    [Fact]
    public async Task GetPagedAsync_FiltersBySeniority()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PersonRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);

        await repository.AddAsync(TestDataFactory.CreatePerson(name: "Experto Uno", seniority: Seniority.Experto));
        await repository.AddAsync(TestDataFactory.CreatePerson(name: "Principiante Uno", seniority: Seniority.Principiante));
        await unitOfWork.SaveChangesAsync();

        (IReadOnlyList<Person> items, int totalCount) = await repository.GetPagedAsync(
            1, 10, seniorities: [4]);

        Assert.Equal(1, totalCount);
        Assert.Equal("Experto Uno", Assert.Single(items).Name);
    }

    [Fact]
    public async Task GetPagedAsync_CombinesSearchAndFilters()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PersonRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);

        await repository.AddAsync(TestDataFactory.CreatePerson(
            name: "María González", seniority: Seniority.Experto));
        await repository.AddAsync(TestDataFactory.CreatePerson(
            name: "María Torres", seniority: Seniority.Principiante));
        await unitOfWork.SaveChangesAsync();

        (IReadOnlyList<Person> items, int totalCount) = await repository.GetPagedAsync(
            1, 10, search: "maría", seniorities: [4]);

        Assert.Equal(1, totalCount);
        Assert.Equal("María González", Assert.Single(items).Name);
    }

    [Fact]
    public async Task GetPagedAsync_UnknownSeniorityValue_ReturnsNoResults()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PersonRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);

        await repository.AddAsync(TestDataFactory.CreatePerson(seniority: Seniority.Experto));
        await unitOfWork.SaveChangesAsync();

        (IReadOnlyList<Person> items, int totalCount) = await repository.GetPagedAsync(
            1, 10, seniorities: [99]);

        Assert.Equal(0, totalCount);
        Assert.Empty(items);
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
