using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using GestionCapacidad.Application.ExternalServices.CompanyRegistry;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.ExternalServices.CompanyRegistry;
using GestionCapacidad.Infrastructure.Options;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.Infrastructure.Persistence.Strategies;
using GestionCapacidad.Infrastructure.Repositories;
using GestionCapacidad.RestClient;

namespace GestionCapacidad.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<PersistenceOptions>(configuration.GetSection(PersistenceOptions.SectionName));

        PersistenceOptions persistenceOptions = configuration
            .GetSection(PersistenceOptions.SectionName)
            .Get<PersistenceOptions>() ?? new PersistenceOptions();

        if (string.Equals(persistenceOptions.Provider, "MongoDb", StringComparison.OrdinalIgnoreCase))
        {
            services.AddSingleton(serviceProvider =>
            {
                PersistenceOptions options = serviceProvider.GetRequiredService<IOptions<PersistenceOptions>>().Value;

                return string.IsNullOrWhiteSpace(options.MongoDbConnectionString)
                    ? throw new InvalidOperationException(
                        "Persistence:MongoDbConnectionString is required when Persistence:Provider is MongoDb.")
                    : (IMongoClient)new MongoClient(options.MongoDbConnectionString);
            });
        }

        services.AddSingleton<IPersistenceStrategy, SqlServerPersistenceStrategy>();
        services.AddSingleton<IPersistenceStrategy, MongoDbPersistenceStrategy>();
        services.AddSingleton<PersistenceStrategyFactory>();

        services.AddDbContext<ApplicationDbContext>((serviceProvider, optionsBuilder) =>
        {
            PersistenceOptions options = serviceProvider.GetRequiredService<IOptions<PersistenceOptions>>().Value;
            PersistenceStrategyFactory factory = serviceProvider.GetRequiredService<PersistenceStrategyFactory>();
            IPersistenceStrategy strategy = factory.Resolve(options);

            strategy.ConfigureDbContext(optionsBuilder, options, serviceProvider);
        });

        services.AddScoped<ICompanyRepository, CompanyRepository>();
        services.AddScoped<ISquadRepository, SquadRepository>();
        services.AddScoped<IPersonRepository, PersonRepository>();
        services.AddScoped<IBauTaskRepository, BauTaskRepository>();
        services.AddScoped<IInitiativeRepository, InitiativeRepository>();
        services.AddScoped<IAllocationRepository, AllocationRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddRestClient<ICompanyRegistryClient, CompanyRegistryClient>(
            configuration.GetSection("HttpClients:CompanyRegistry"));

        return services;
    }
}
