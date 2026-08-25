using GestionCapacidad.WebApi.Endpoints;

namespace GestionCapacidad.WebApi.Extensions;

public static class EndpointDefinitionExtensions
{
    public static IServiceCollection AddEndpointDefinitions(this IServiceCollection services)
    {
        var definitions = typeof(IEndpointDefinition).Assembly
            .GetTypes()
            .Where(t => typeof(IEndpointDefinition).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract)
            .Select(Activator.CreateInstance)
            .Cast<IEndpointDefinition>();

        foreach (var definition in definitions)
        {
            services.AddSingleton(definition);
        }

        return services;
    }

    public static WebApplication MapEndpointDefinitions(this WebApplication app)
    {
        var definitions = app.Services.GetServices<IEndpointDefinition>();

        foreach (var definition in definitions)
        {
            definition.MapEndpoints(app);
        }

        return app;
    }
}
