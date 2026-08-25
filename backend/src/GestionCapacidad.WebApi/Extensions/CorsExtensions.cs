using GestionCapacidad.WebApi.Options;

namespace GestionCapacidad.WebApi.Extensions;

public static class CorsExtensions
{
    public const string DefaultCorsPolicy = "DefaultCorsPolicy";

    public static IServiceCollection AddCorsPolicy(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        CorsOptions corsOptions = configuration
            .GetSection(CorsOptions.SectionName)
            .Get<CorsOptions>() ?? new CorsOptions();

        services.AddCors(options =>
        {
            options.AddPolicy(DefaultCorsPolicy, policy =>
            {
                if (corsOptions.AllowedOrigins.Length > 0)
                {
                    policy.WithOrigins(corsOptions.AllowedOrigins);
                }
                else
                {
                    policy.SetIsOriginAllowed(_ => false);
                }

                policy
                    .WithMethods(corsOptions.AllowedMethods.Length > 0
                        ? corsOptions.AllowedMethods
                        : ["GET", "POST", "PUT", "DELETE"])
                    .WithHeaders(corsOptions.AllowedHeaders.Length > 0
                        ? corsOptions.AllowedHeaders
                        : ["Content-Type", "Idempotency-Key"]);
            });
        });

        return services;
    }
}
