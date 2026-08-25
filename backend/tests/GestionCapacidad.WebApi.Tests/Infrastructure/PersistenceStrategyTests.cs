using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using Moq;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Options;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Persistence.Strategies;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class PersistenceStrategyTests
{
    [Fact]
    public void Factory_ResolvesSqlServerStrategy()
    {
        PersistenceStrategyFactory factory = CreateFactory();
        var options = new PersistenceOptions { Provider = "SqlServer" };

        IPersistenceStrategy strategy = factory.Resolve(options);

        Assert.Equal(PersistenceProvider.SqlServer, strategy.Provider);
    }

    [Fact]
    public void Factory_ResolvesMongoDbStrategy()
    {
        PersistenceStrategyFactory factory = CreateFactory();
        var options = new PersistenceOptions { Provider = "MongoDb" };

        IPersistenceStrategy strategy = factory.Resolve(options);

        Assert.Equal(PersistenceProvider.MongoDb, strategy.Provider);
    }

    [Fact]
    public void DomainAssembly_DoesNotContainPersistenceProvider()
    {
        Assembly domainAssembly = typeof(Company).Assembly;

        Assert.Null(domainAssembly.GetType("GestionCapacidad.Domain.Enums.PersistenceProvider"));
        Assert.Null(domainAssembly.GetType("GestionCapacidad.Domain.PersistenceProvider"));
    }

    [Fact]
    public void Factory_ThrowsForUnsupportedProvider()
    {
        PersistenceStrategyFactory factory = CreateFactory();
        var options = new PersistenceOptions { Provider = "PostgreSql" };

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() => factory.Resolve(options));

        Assert.Contains("not supported", exception.Message);
    }

    [Fact]
    public void SqlServerStrategy_ThrowsWhenConnectionStringIsMissing()
    {
        var strategy = new SqlServerPersistenceStrategy();
        var builder = new DbContextOptionsBuilder<ApplicationDbContext>();
        var options = new PersistenceOptions { Provider = "SqlServer", SqlServerConnectionString = "" };
        IServiceProvider serviceProvider = new ServiceCollection().BuildServiceProvider();

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() =>
            strategy.ConfigureDbContext(builder, options, serviceProvider));

        Assert.Contains("SqlServerConnectionString", exception.Message);
    }

    [Fact]
    public void MongoDbStrategy_ThrowsWhenDatabaseNameIsMissing()
    {
        var strategy = new MongoDbPersistenceStrategy();
        var builder = new DbContextOptionsBuilder<ApplicationDbContext>();
        var options = new PersistenceOptions
        {
            Provider = "MongoDb",
            MongoDbConnectionString = "mongodb://localhost:27017",
            MongoDbDatabaseName = ""
        };
        IServiceProvider serviceProvider = new ServiceCollection().BuildServiceProvider();

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() =>
            strategy.ConfigureDbContext(builder, options, serviceProvider));

        Assert.Contains("MongoDbDatabaseName", exception.Message);
    }

    [Fact]
    public void MongoDbStrategy_ConfiguresMongoDbProviderOptions()
    {
        var strategy = new MongoDbPersistenceStrategy();
        var builder = new DbContextOptionsBuilder<ApplicationDbContext>();
        var options = new PersistenceOptions
        {
            Provider = "MongoDb",
            MongoDbConnectionString = "mongodb://localhost:27017",
            MongoDbDatabaseName = "GestionCapacidadDb"
        };
        var mongoClient = new Mock<IMongoClient>();
        IServiceProvider serviceProvider = new ServiceCollection()
            .AddSingleton(mongoClient.Object)
            .BuildServiceProvider();

        strategy.ConfigureDbContext(builder, options, serviceProvider);

        Assert.Contains(builder.Options.Extensions, extension =>
            extension.GetType().FullName?.Contains("Mongo", StringComparison.OrdinalIgnoreCase) == true);
    }

    [Fact]
    public void MongoDbStrategy_RequiresMongoClientFromServiceProvider()
    {
        var strategy = new MongoDbPersistenceStrategy();
        var builder = new DbContextOptionsBuilder<ApplicationDbContext>();
        var options = new PersistenceOptions
        {
            Provider = "MongoDb",
            MongoDbConnectionString = "mongodb://localhost:27017",
            MongoDbDatabaseName = "GestionCapacidadDb"
        };
        IServiceProvider serviceProvider = new ServiceCollection().BuildServiceProvider();

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() =>
            strategy.ConfigureDbContext(builder, options, serviceProvider));

        Assert.Contains(nameof(IMongoClient), exception.Message);
    }

    [Fact]
    public void AddInfrastructure_RegistersMongoClientAsSingletonWhenMongoDbIsSelected()
    {
        IConfiguration configuration = CreateConfiguration(new Dictionary<string, string?>
        {
            ["Persistence:Provider"] = "MongoDb",
            ["Persistence:MongoDbConnectionString"] = "mongodb://localhost:27017",
            ["Persistence:MongoDbDatabaseName"] = "GestionCapacidadDb"
        });
        ServiceProvider serviceProvider = new ServiceCollection()
            .AddInfrastructure(configuration)
            .BuildServiceProvider();

        IMongoClient firstClient = serviceProvider.GetRequiredService<IMongoClient>();
        IMongoClient secondClient = serviceProvider.GetRequiredService<IMongoClient>();

        Assert.Same(firstClient, secondClient);
    }

    [Fact]
    public void AddInfrastructure_DoesNotRequireMongoDbConfigurationWhenSqlServerIsSelected()
    {
        IConfiguration configuration = CreateConfiguration(new Dictionary<string, string?>
        {
            ["Persistence:Provider"] = "SqlServer",
            ["Persistence:SqlServerConnectionString"] = "Server=(localdb)\\MSSQLLocalDB;Database=GestionCapacidadWebApi;Trusted_Connection=True;"
        });
        ServiceProvider serviceProvider = new ServiceCollection()
            .AddInfrastructure(configuration)
            .BuildServiceProvider();

        Assert.Null(serviceProvider.GetService<IMongoClient>());
    }

    private static PersistenceStrategyFactory CreateFactory()
    {
        return new PersistenceStrategyFactory(
        [
            new SqlServerPersistenceStrategy(),
            new MongoDbPersistenceStrategy()
        ]);
    }

    private static IConfiguration CreateConfiguration(Dictionary<string, string?> values)
    {
        values.TryAdd("HttpClients:CompanyRegistry:BaseAddress", "https://example.com/company-registry/");
        values.TryAdd("HttpClients:CompanyRegistry:TimeoutSeconds", "30");
        values.TryAdd("HttpClients:CompanyRegistry:Resilience:Preset", "TimeoutOnly");
        values.TryAdd("HttpClients:CompanyRegistry:Resilience:Timeout:Seconds", "10");

        return new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
    }
}
