using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using GestionCapacidad.Infrastructure.Options;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.WebApi.Extensions;

public static class HealthCheckExtensions
{
    private static readonly JsonSerializerOptions HealthCheckJsonOptions = JsonSerializerOptions.Web;

    public static IServiceCollection AddConfiguredHealthChecks(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddHealthChecks()
            .AddCheck<SelfHealthCheck>(
                "self",
                tags: ["live"])
            .AddCheck<SelectedPersistenceHealthCheck>(
                "persistence",
                tags: ["ready"]);

        return services;
    }

    public static IEndpointRouteBuilder MapConfiguredHealthChecks(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = registration => registration.Tags.Contains("live"),
            ResponseWriter = WriteHealthCheckResponseAsync
        });

        endpoints.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = registration => registration.Tags.Contains("ready"),
            ResponseWriter = WriteHealthCheckResponseAsync
        });

        endpoints.MapHealthChecks("/health", new HealthCheckOptions
        {
            Predicate = registration => registration.Tags.Contains("ready"),
            ResponseWriter = WriteHealthCheckResponseAsync
        });

        return endpoints;
    }

    public static Task WriteHealthCheckResponseAsync(HttpContext httpContext, HealthReport report)
    {
        httpContext.Response.ContentType = "application/json";

        var payload = new
        {
            status = report.Status.ToString(),
            totalDuration = report.TotalDuration,
            entries = report.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString(),
                description = entry.Value.Description,
                duration = entry.Value.Duration,
                tags = entry.Value.Tags,
                error = entry.Value.Exception?.Message
            })
        };

        return httpContext.Response.WriteAsync(
            JsonSerializer.Serialize(payload, HealthCheckJsonOptions),
            httpContext.RequestAborted);
    }

    public sealed class SelfHealthCheck : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(HealthCheckResult.Healthy("Process is alive."));
        }
    }

    public sealed class SelectedPersistenceHealthCheck(
        IServiceScopeFactory scopeFactory,
        IOptions<PersistenceOptions> persistenceOptions,
        IServiceProvider serviceProvider) : IHealthCheck
    {
        public async Task<HealthCheckResult> CheckHealthAsync(
            HealthCheckContext context,
            CancellationToken cancellationToken = default)
        {
            if (!Enum.TryParse(
                    persistenceOptions.Value.Provider,
                    ignoreCase: true,
                    out PersistenceProvider provider))
            {
                return HealthCheckResult.Unhealthy(
                    $"Persistence provider '{persistenceOptions.Value.Provider}' is not supported.");
            }

            try
            {
                return provider switch
                {
                    PersistenceProvider.SqlServer => await CheckSqlServerAsync(cancellationToken),
                    PersistenceProvider.MongoDb => await CheckMongoDbAsync(cancellationToken),
                    _ => HealthCheckResult.Unhealthy($"Persistence provider '{provider}' is not supported.")
                };
            }
            catch (Exception exception)
            {
                return HealthCheckResult.Unhealthy(
                    "Selected persistence provider is unavailable or misconfigured.",
                    exception);
            }
        }

        private async Task<HealthCheckResult> CheckSqlServerAsync(CancellationToken cancellationToken)
        {
            using IServiceScope scope = scopeFactory.CreateScope();
            ApplicationDbContext dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var canConnect = await dbContext.Database.CanConnectAsync(cancellationToken);

            return canConnect
                ? HealthCheckResult.Healthy("SQL Server persistence provider is available.")
                : HealthCheckResult.Unhealthy("SQL Server persistence provider is unavailable.");
        }

        private async Task<HealthCheckResult> CheckMongoDbAsync(CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(persistenceOptions.Value.MongoDbDatabaseName))
            {
                return HealthCheckResult.Unhealthy(
                    "Persistence:MongoDbDatabaseName is required when Persistence:Provider is MongoDb.");
            }

            IMongoClient mongoClient = serviceProvider.GetRequiredService<IMongoClient>();
            IMongoDatabase database = mongoClient.GetDatabase(persistenceOptions.Value.MongoDbDatabaseName);

            await database.RunCommandAsync<BsonDocument>(
                new BsonDocument("ping", 1),
                cancellationToken: cancellationToken);

            return HealthCheckResult.Healthy("MongoDB persistence provider is available.");
        }
    }
}
