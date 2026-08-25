using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using GestionCapacidad.WebApi.Options;
using GestionCapacidad.WebApi.Swagger.Examples;
using Swashbuckle.AspNetCore.Filters;

namespace GestionCapacidad.WebApi.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerDocumentation(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ObservabilityOptions observabilityOptions = configuration
            .GetSection(ObservabilityOptions.SectionName)
            .Get<ObservabilityOptions>() ?? new ObservabilityOptions();

        var title = string.IsNullOrWhiteSpace(observabilityOptions.ServiceName)
            ? "GestionCapacidad.WebApi"
            : observabilityOptions.ServiceName;

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = title,
                Version = "v1"
            });

            var xmlFile = $"{typeof(Program).Assembly.GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath);
            }

            options.ExampleFilters();
        });

        services.AddSwaggerExamplesFromAssemblyOf<AllocationDtoExample>();

        return services;
    }

    public static IApplicationBuilder UseSwaggerDocumentation(this WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "GestionCapacidad.WebApi v1");
        });

        return app;
    }
}
