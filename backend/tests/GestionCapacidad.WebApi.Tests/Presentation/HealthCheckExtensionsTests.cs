using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using Moq;
using GestionCapacidad.Infrastructure.Options;
using GestionCapacidad.WebApi.Extensions;

namespace GestionCapacidad.WebApi.Tests.Presentation;

public sealed class HealthCheckExtensionsTests
{
    [Fact]
    public async Task LiveHealthCheck_IsIndependentOfPersistence()
    {
        ServiceProvider serviceProvider = new ServiceCollection()
            .AddLogging()
            .AddConfiguredHealthChecks(CreateConfiguration(new Dictionary<string, string?>
            {
                ["Persistence:Provider"] = "Unsupported"
            }))
            .BuildServiceProvider();
        HealthCheckService healthCheckService = serviceProvider.GetRequiredService<HealthCheckService>();

        HealthReport report = await healthCheckService.CheckHealthAsync(
            registration => registration.Tags.Contains("live"));

        Assert.Equal(HealthStatus.Healthy, report.Status);
        Assert.Single(report.Entries);
        Assert.True(report.Entries.ContainsKey("self"));
    }

    [Fact]
    public async Task ReadyHealthCheck_ReturnsUnhealthyForUnsupportedPersistenceProvider()
    {
        ServiceProvider serviceProvider = new ServiceCollection().BuildServiceProvider();
        var healthCheck = new HealthCheckExtensions.SelectedPersistenceHealthCheck(
            serviceProvider.GetRequiredService<IServiceScopeFactory>(),
            Microsoft.Extensions.Options.Options.Create(new PersistenceOptions { Provider = "Unsupported" }),
            serviceProvider);

        HealthCheckResult result = await healthCheck.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Unhealthy, result.Status);
        Assert.Contains("not supported", result.Description);
    }

    [Fact]
    public async Task MongoDbReadyHealthCheck_UsesMongoClientFromDependencyInjection()
    {
        var database = new Mock<IMongoDatabase>();
        database
            .Setup(mongoDatabase => mongoDatabase.RunCommandAsync(
                It.IsAny<Command<BsonDocument>>(),
                null,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new BsonDocument("ok", 1));

        var mongoClient = new Mock<IMongoClient>();
        mongoClient
            .Setup(client => client.GetDatabase("GestionCapacidadDb", null))
            .Returns(database.Object);

        ServiceProvider serviceProvider = new ServiceCollection()
            .AddSingleton(mongoClient.Object)
            .BuildServiceProvider();

        var healthCheck = new HealthCheckExtensions.SelectedPersistenceHealthCheck(
            serviceProvider.GetRequiredService<IServiceScopeFactory>(),
            Microsoft.Extensions.Options.Options.Create(new PersistenceOptions
            {
                Provider = "MongoDb",
                MongoDbDatabaseName = "GestionCapacidadDb"
            }),
            serviceProvider);

        HealthCheckResult result = await healthCheck.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Healthy, result.Status);
        mongoClient.Verify(client => client.GetDatabase("GestionCapacidadDb", null), Times.Once);
        database.Verify(mongoDatabase => mongoDatabase.RunCommandAsync(
            It.IsAny<Command<BsonDocument>>(),
            null,
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task WriteHealthCheckResponseAsync_ReturnsExpectedJsonShape()
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Response.Body = new MemoryStream();
        var report = new HealthReport(
            new Dictionary<string, HealthReportEntry>
            {
                ["self"] = new(
                    HealthStatus.Healthy,
                    "Process is alive.",
                    TimeSpan.FromMilliseconds(5),
                    exception: null,
                    data: null,
                    tags: ["live"])
            },
            TimeSpan.FromMilliseconds(7));

        await HealthCheckExtensions.WriteHealthCheckResponseAsync(httpContext, report);

        httpContext.Response.Body.Position = 0;
        using JsonDocument document = await JsonDocument.ParseAsync(httpContext.Response.Body);
        JsonElement root = document.RootElement;

        Assert.Equal("application/json", httpContext.Response.ContentType);
        Assert.Equal("Healthy", root.GetProperty("status").GetString());
        Assert.True(root.TryGetProperty("totalDuration", out _));
        JsonElement entry = root.GetProperty("entries").EnumerateArray().Single();
        Assert.Equal("self", entry.GetProperty("name").GetString());
        Assert.Equal("Healthy", entry.GetProperty("status").GetString());
        Assert.Equal("Process is alive.", entry.GetProperty("description").GetString());
        Assert.True(entry.TryGetProperty("duration", out _));
        Assert.Equal("live", entry.GetProperty("tags").EnumerateArray().Single().GetString());
        Assert.Equal(JsonValueKind.Null, entry.GetProperty("error").ValueKind);
    }

    private static IConfiguration CreateConfiguration(Dictionary<string, string?> values)
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
    }
}
