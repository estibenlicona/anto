using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using GestionCapacidad.Application.ModelParameters;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Repositories;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class ModelParameterRepositoryTests
{
    [Fact]
    public async Task SprintConfiguration_SurvivesARoundTrip()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SingleDocumentRepository<SprintConfiguration>(dbContext);

        await repository.AddAsync(new SprintConfiguration(3, 5, 90.5m, "18:30", 10, 4));
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        SprintConfiguration? saved = await new SingleDocumentRepository<SprintConfiguration>(reader).GetAsync();

        Assert.NotNull(saved);
        Assert.Equal(3, saved.Weeks);
        Assert.Equal(90.5m, saved.HoursPerSprint);
        Assert.Equal("18:30", saved.SprintCloseTime);
        Assert.Equal(10, saved.HistoryWindowSprints);
        Assert.Equal(4, saved.MinHistorySprints);
    }

    [Fact]
    public async Task TallaBands_KeepsBoundariesAndBandOrder()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);

        await new SingleDocumentRepository<TallaBandSet>(dbContext).AddAsync(ModelParameterDefaults.TallaBands());
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        TallaBandSet? saved = await new SingleDocumentRepository<TallaBandSet>(reader).GetAsync();

        Assert.NotNull(saved);
        Assert.Equal([20m, 40m, 60m, 80m], saved.Boundaries);
        Assert.Equal(["XS", "S", "M", "L", "XL"], saved.Bands.OrderBy(b => b.Position).Select(b => b.Talla));
        Assert.Equal(0.5m, saved.Bands.OrderBy(b => b.Position).First().PmMin);
        Assert.Equal("Transformación mayor", saved.Bands.OrderBy(b => b.Position).Last().Lectura);
    }

    [Fact]
    public async Task CapabilityMix_KeepsTheAmountsPerTalla()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);

        await new SingleDocumentRepository<CapabilityMix>(dbContext).AddAsync(ModelParameterDefaults.CapabilityMix());
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        CapabilityMix? saved = await new SingleDocumentRepository<CapabilityMix>(reader).GetAsync();

        Assert.NotNull(saved);
        Assert.Equal(
            ["Backend Dev", "Frontend Dev", "QA Engineer", "Arquitecto", "DevOps Engineer", "Data Engineer"],
            saved.Rows.OrderBy(r => r.Position).Select(r => r.Capacidad));

        CapabilityMixRow backend = saved.Rows.Single(r => r.Key == "backend-dev");
        Assert.Equal(1, backend.PorTalla["XS"]);
        Assert.Equal(4, backend.PorTalla["XL"]);
    }

    [Fact]
    public async Task QuestionPool_KeepsTheThirtyQuestionsWithTheirDimension()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);

        await new SingleDocumentRepository<QuestionPool>(dbContext).AddAsync(ModelParameterDefaults.QuestionPool());
        await new UnitOfWork(dbContext).SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        QuestionPool? saved = await new SingleDocumentRepository<QuestionPool>(reader).GetAsync();

        Assert.NotNull(saved);
        Assert.Equal(30, saved.Questions.Count);

        PoolQuestion first = saved.Questions.OrderBy(q => q.Position).First();
        Assert.Equal("N1", first.Code);
        Assert.Equal(QuestionDimension.NegocioYCliente, first.Dimension);
        Assert.Equal(2, first.Peso);
    }

    [Fact]
    public async Task Replace_UpdatesTheStoredRowInsteadOfAddingASecond()
    {
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync();
        await using ApplicationDbContext dbContext = await CreateDbContextAsync(connection);
        var repository = new SingleDocumentRepository<CapabilityMix>(dbContext);
        var unitOfWork = new UnitOfWork(dbContext);

        await repository.AddAsync(ModelParameterDefaults.CapabilityMix());
        await unitOfWork.SaveChangesAsync();

        CapabilityMix? stored = await repository.GetAsync();
        Assert.NotNull(stored);
        stored.Replace([new CapabilityMixRow(0, "arquitecto", "Arquitecto", new Dictionary<string, int> { ["M"] = 2 })]);
        repository.Update(stored);
        await unitOfWork.SaveChangesAsync();

        await using ApplicationDbContext reader = await CreateDbContextAsync(connection);
        Assert.Equal(1, await reader.CapabilityMixes.CountAsync());

        CapabilityMix? saved = await new SingleDocumentRepository<CapabilityMix>(reader).GetAsync();
        Assert.NotNull(saved);
        CapabilityMixRow only = Assert.Single(saved.Rows);
        Assert.Equal("Arquitecto", only.Capacidad);
        Assert.Equal(2, only.PorTalla["M"]);
    }

    [Fact]
    public void AddInfrastructure_RegistersTheFourSingleDocumentRepositories()
    {
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Persistence:Provider"] = "InMemory",
                ["HttpClients:CompanyRegistry:BaseAddress"] = "https://example.com/company-registry/",
                ["HttpClients:CompanyRegistry:TimeoutSeconds"] = "30",
                ["HttpClients:CompanyRegistry:Resilience:Preset"] = "TimeoutOnly",
                ["HttpClients:CompanyRegistry:Resilience:Timeout:Seconds"] = "10",
                ["HttpClients:AzureDevOps:BaseAddress"] = "https://example.com/azure-devops/",
                ["HttpClients:AzureDevOps:TimeoutSeconds"] = "30",
            })
            .Build();

        using ServiceProvider serviceProvider = new ServiceCollection()
            .AddLogging()
            .AddInfrastructure(configuration)
            .BuildServiceProvider();

        using IServiceScope scope = serviceProvider.CreateScope();

        Assert.NotNull(scope.ServiceProvider.GetRequiredService<ISingleDocumentRepository<SprintConfiguration>>());
        Assert.NotNull(scope.ServiceProvider.GetRequiredService<ISingleDocumentRepository<TallaBandSet>>());
        Assert.NotNull(scope.ServiceProvider.GetRequiredService<ISingleDocumentRepository<CapabilityMix>>());
        Assert.NotNull(scope.ServiceProvider.GetRequiredService<ISingleDocumentRepository<QuestionPool>>());
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
