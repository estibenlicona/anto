using GestionCapacidad.Infrastructure.Options;
using GestionCapacidad.WebApi.Options;

namespace GestionCapacidad.WebApi.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationOptions(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<PersistenceOptions>(configuration.GetSection(PersistenceOptions.SectionName));
        services.Configure<CorsOptions>(configuration.GetSection(CorsOptions.SectionName));
        services.Configure<ObservabilityOptions>(configuration.GetSection(ObservabilityOptions.SectionName));
        services.Configure<AzureAppConfigurationOptions>(configuration.GetSection(AzureAppConfigurationOptions.SectionName));

        return services;
    }
}
