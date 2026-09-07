using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class AbsenceRepositoryTests
{
    private static readonly Guid PersonId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly DateOnly Monday5 = new(2026, 10, 5);
    private static readonly DateOnly Wednesday7 = new(2026, 10, 7);

    [Fact]
    public async Task SavesAndReadsBackAnAbsenceWithAllItsFields()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new AbsenceRepository(dbContext);

        var absence = new Absence(PersonId, AbsenceType.Leave, Monday5, Monday5, true, true);
        await repository.AddAsync(absence);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        Absence? saved = await new AbsenceRepository(reader).GetByIdAsync(absence.Id);

        Assert.NotNull(saved);
        Assert.Equal(PersonId, saved.PersonId);
        Assert.Equal(AbsenceType.Leave, saved.Type);
        Assert.Equal(AbsenceStatus.Requested, saved.Status);
        Assert.Equal(Monday5, saved.StartDate);
        Assert.Equal(Monday5, saved.EndDate);
        Assert.True(saved.StartsHalfDay);
        Assert.True(saved.EndsHalfDay);
        Assert.Null(saved.RejectReason);
    }

    [Fact]
    public async Task KeepsTheRejectReason()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new AbsenceRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);

        var absence = new Absence(PersonId, AbsenceType.Vacation, Monday5, Wednesday7, false, false);
        await repository.AddAsync(absence);
        await unitOfWork.SaveChangesAsync();

        absence.Approve();
        absence.Reject("Se aprobó por error");
        repository.Update(absence);
        await unitOfWork.SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        Absence? saved = await new AbsenceRepository(reader).GetByIdAsync(absence.Id);

        Assert.NotNull(saved);
        Assert.Equal(AbsenceStatus.Rejected, saved.Status);
        Assert.Equal("Se aprobó por error", saved.RejectReason);
    }

    [Fact]
    public async Task GetByPerson_ReturnsOnlyTheirs()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new AbsenceRepository(dbContext);
        var other = Guid.Parse("22222222-2222-2222-2222-222222222222");

        await repository.AddAsync(new Absence(PersonId, AbsenceType.Vacation, Monday5, Wednesday7, false, false));
        await repository.AddAsync(new Absence(other, AbsenceType.Vacation, Monday5, Wednesday7, false, false));
        await new UnitOfWork(dbContext).SaveChangesAsync();

        IReadOnlyList<Absence> own = await repository.GetByPersonAsync(PersonId);

        Absence single = Assert.Single(own);
        Assert.Equal(PersonId, single.PersonId);
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
