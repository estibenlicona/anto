using Azure.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.ExternalServices.AzureDevOps;
using GestionCapacidad.Application.ExternalServices.CompanyRegistry;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Infrastructure.Catalogs;
using GestionCapacidad.Infrastructure.ExternalServices.AzureDevOps;
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
        IConfiguration configuration,
        bool isDevelopment = false)
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
        services.AddSingleton<IPersistenceStrategy, PostgresPersistenceStrategy>();
        services.AddSingleton<IPersistenceStrategy, MongoDbPersistenceStrategy>();
        services.AddSingleton<IPersistenceStrategy, InMemoryPersistenceStrategy>();
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
        services.AddScoped<IAbsenceRepository, AbsenceRepository>();
        services.AddScoped<IPrefactureRepository, PrefactureRepository>();
        services.AddScoped<ISkillRepository, SkillRepository>();
        services.AddScoped<IAssessmentRepository, AssessmentRepository>();
        services.AddScoped<ISprintRepository, SprintRepository>();
        services.AddScoped<ISprintSnapshotRepository, SprintSnapshotRepository>();
        services.AddScoped<IPlanActionRepository, PlanActionRepository>();
        services.AddScoped<IExpertiseLineRepository, ExpertiseLineRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Parámetros del modelo: cuatro agregados de fila única, un repositorio.
        services.AddScoped<ISingleDocumentRepository<SprintConfiguration>, SingleDocumentRepository<SprintConfiguration>>();
        services.AddScoped<ISingleDocumentRepository<TallaBandSet>, SingleDocumentRepository<TallaBandSet>>();
        services.AddScoped<ISingleDocumentRepository<CapabilityMix>, SingleDocumentRepository<CapabilityMix>>();
        services.AddScoped<ISingleDocumentRepository<QuestionPool>, SingleDocumentRepository<QuestionPool>>();
        services.AddScoped<ISingleDocumentRepository<SkillCatalogVersion>, SingleDocumentRepository<SkillCatalogVersion>>();

        services.AddSingleton<IStackCatalog, ChapterStackCatalog>();
        services.AddSingleton<IChapterCatalog, ChapterDirectoryCatalog>();

        // El modelo de evaluación se compone desde los parámetros de Admin en
        // cada petición, así que sigue el ciclo de vida de sus repositorios.
        services.AddScoped<IEvaluationModelProvider, EvaluationModelProvider>();
        services.AddRestClient<ICompanyRegistryClient, CompanyRegistryClient>(
            configuration.GetSection("HttpClients:CompanyRegistry"));

        AzureDevOpsOptions azureDevOpsOptions = configuration
            .GetSection(AzureDevOpsOptions.SectionName)
            .Get<AzureDevOpsOptions>()
            ?? throw new InvalidOperationException(
                $"Configuration section '{AzureDevOpsOptions.SectionName}' could not be bound.");

        IHttpClientBuilder azureDevOpsClientBuilder = services.AddHttpClient<IAzureDevOpsClient, AzureDevOpsClient>(client =>
        {
            client.BaseAddress = azureDevOpsOptions.BaseAddress;
            client.Timeout = TimeSpan.FromSeconds(azureDevOpsOptions.TimeoutSeconds);
        });

        // Autenticación por ambiente, no por configuración — ver design.md
        // de backend-modulo-azure-devops-sync, decisión 9.
        if (isDevelopment)
        {
            azureDevOpsClientBuilder.AddHttpMessageHandler(() =>
                new AzureDevOpsPatAuthHandler(azureDevOpsOptions.Pat ?? string.Empty));
        }
        else
        {
            azureDevOpsClientBuilder.AddHttpMessageHandler(() =>
                new AzureDevOpsFederatedAuthHandler(new DefaultAzureCredential(), azureDevOpsOptions.Scope));
        }

        return services;
    }
}
