using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class PrefactureRepositoryTests
{
    private static readonly Guid PersonId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid ProviderId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    [Fact]
    public async Task SavesAndReadsBackAPrefactureWithDocumentAndImputation()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PrefactureRepository(dbContext);

        var prefacture = new Prefacture(PersonId, "Paula Ramírez", "Data Engineer", "Plataforma de Datos", ProviderId, 6_000_000m, "2026-10");
        var imputation = new Imputation("Plataforma de Datos", "Servicios profesionales", "Servicios técnicos", "5135-05", "CC-1001", null, "Bancolombia 4567");
        prefacture.RegisterDocument(new PrefactureDocument("FE-2049", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, imputation));
        prefacture.SetAdjustment(new BillingAdjustment(100_000, AdjustmentReason.Overtime, "Turno extra"));
        await repository.AddAsync(prefacture);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        Prefacture? saved = await new PrefactureRepository(reader).GetByIdAsync(prefacture.Id);

        Assert.NotNull(saved);
        Assert.Equal("Paula Ramírez", saved.PersonName);
        Assert.Equal(BillingStatus.InReview, saved.Status);
        Assert.NotNull(saved.Document);
        Assert.Equal("FE-2049", saved.Document!.Number);
        Assert.Equal(6_000_000, saved.Document.Amount);
        Assert.Equal("CC-1001", saved.Document.Imputation.CostCenter);
        Assert.Null(saved.Document.Imputation.PurchaseOrder);
        Assert.NotNull(saved.Adjustment);
        Assert.Equal(100_000, saved.Adjustment!.Amount);
        Assert.Equal(AdjustmentReason.Overtime, saved.Adjustment.Reason);
    }

    [Fact]
    public async Task SavesAndReadsBackAnApprovedPrefactureWithItsFrozenDiscount()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PrefactureRepository(dbContext);

        var prefacture = new Prefacture(PersonId, "Paula Ramírez", "Data Engineer", null, ProviderId, 6_000_000m, "2026-10");
        prefacture.RegisterDocument(new PrefactureDocument("FE-1", new DateOnly(2026, 10, 5), 6_000_000m, Currency.Cop, Imputation.Empty));
        prefacture.Approve(new AbsenceDiscount(3m, 300_000), "Se aprueba con nota", DateTime.UtcNow);
        await repository.AddAsync(prefacture);
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        Prefacture? saved = await new PrefactureRepository(reader).GetByIdAsync(prefacture.Id);

        Assert.NotNull(saved);
        Assert.Equal(BillingStatus.Approved, saved.Status);
        Assert.NotNull(saved.FrozenDiscount);
        Assert.Equal(300_000, saved.FrozenDiscount!.Amount);
        Assert.Equal("Se aprueba con nota", saved.ApprovalNote);
        Assert.NotNull(saved.ApprovedAtUtc);
    }

    [Fact]
    public async Task InsertingTwoWithTheSamePersonAndPeriod_ViolatesTheUniqueIndex()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PrefactureRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);

        await repository.AddAsync(new Prefacture(PersonId, "Paula Ramírez", "Data Engineer", null, ProviderId, 6_000_000m, "2026-10"));
        await unitOfWork.SaveChangesAsync();

        await repository.AddAsync(new Prefacture(PersonId, "Paula Ramírez", "Data Engineer", null, ProviderId, 6_000_000m, "2026-10"));

        await Assert.ThrowsAnyAsync<DbUpdateException>(() => unitOfWork.SaveChangesAsync());
    }

    [Fact]
    public async Task GetByPeriod_ReturnsOnlyThatPeriod()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new PrefactureRepository(dbContext);

        await repository.AddAsync(new Prefacture(PersonId, "Paula Ramírez", "Data Engineer", null, ProviderId, 6_000_000m, "2026-10"));
        await repository.AddAsync(new Prefacture(PersonId, "Paula Ramírez", "Data Engineer", null, ProviderId, 6_000_000m, "2026-09"));
        await new UnitOfWork(dbContext).SaveChangesAsync();

        IReadOnlyList<Prefacture> october = await repository.GetByPeriodAsync("2026-10");

        Prefacture single = Assert.Single(october);
        Assert.Equal("2026-10", single.Period);
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
