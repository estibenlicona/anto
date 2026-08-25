using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;
using GestionCapacidad.WebApi.Tests.SharedKernel;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class CompanyRepositoryTests
{
    [Fact]
    public async Task Repository_SavesAndQueriesACompany()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new CompanyRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        Company company = TestDataFactory.CreateCompany();

        await repository.AddAsync(company);
        await unitOfWork.SaveChangesAsync();

        Company? savedCompany = await repository.GetByIdAsync(company.Id);

        Assert.NotNull(savedCompany);
        Assert.Equal(company.Name, savedCompany.Name);
        Assert.Equal(company.IdentificationNumber, savedCompany.IdentificationNumber);
        Assert.True(savedCompany.IsActive);
    }

    [Fact]
    public async Task Repository_ValidatesLookupByIdentificationNumber()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();

        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new CompanyRepository(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);
        var identificationNumber = TestDataFactory.UniqueIdentificationNumber();
        Company company = TestDataFactory.CreateCompany(identificationNumber: identificationNumber);

        await repository.AddAsync(company);
        await unitOfWork.SaveChangesAsync();

        Company? foundCompany = await repository.GetByIdentificationNumberAsync(identificationNumber);
        var exists = await repository.ExistsByIdentificationNumberAsync(identificationNumber);

        Assert.NotNull(foundCompany);
        Assert.Equal(company.Id, foundCompany.Id);
        Assert.True(exists);
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
