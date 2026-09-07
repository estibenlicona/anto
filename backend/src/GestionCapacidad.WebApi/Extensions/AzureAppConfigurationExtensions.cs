using Azure.Identity;
using Microsoft.Extensions.Configuration.AzureAppConfiguration;
using AppConfigOptions = GestionCapacidad.WebApi.Options.AzureAppConfigurationOptions;

namespace GestionCapacidad.WebApi.Extensions;

public static class AzureAppConfigurationExtensions
{
    public const string EndpointEnvironmentVariable = "AzureAppConfiguration__Endpoint";

    /// <summary>
    /// De dónde sale el secreto lo decide el entorno, no una bandera. En
    /// Development no se toca Azure en absoluto: la cadena de conexión a
    /// Postgres sale de los User Secrets de la máquina. Fuera de Development
    /// —certificación y producción se comportan igual, sin excepción— se
    /// conecta siempre a Azure App Configuration con identidad federada de
    /// carga de trabajo (<see cref="DefaultAzureCredential"/>): no hay ninguna
    /// credencial de larga vida en el pipeline ni en la imagen.
    /// </summary>
    public static WebApplicationBuilder AddOptionalAzureAppConfiguration(this WebApplicationBuilder builder)
    {
        if (builder.Environment.IsDevelopment())
        {
            return builder;
        }

        AppConfigOptions options = ResolveOptions(builder.Configuration);

        if (string.IsNullOrWhiteSpace(options.Endpoint))
        {
            throw new InvalidOperationException(
                $"{EndpointEnvironmentVariable} must be configured outside Development.");
        }

        builder.Configuration.AddAzureAppConfiguration(azureOptions =>
        {
            azureOptions.Connect(new Uri(options.Endpoint), new DefaultAzureCredential());

            if (!string.IsNullOrWhiteSpace(options.Label))
            {
                azureOptions.Select(KeyFilter.Any, options.Label);
            }
        });

        return builder;
    }

    /// <summary>
    /// El endpoint sale sólo de la variable de entorno, nunca de
    /// <c>appsettings</c>: es lo único que cambia por entorno y no debe
    /// quedar escrito en un archivo versionado.
    /// </summary>
    public static AppConfigOptions ResolveOptions(
        IConfiguration configuration,
        Func<string, string?>? getEnvironmentVariable = null)
    {
        getEnvironmentVariable ??= Environment.GetEnvironmentVariable;

        AppConfigOptions options = configuration
            .GetSection(AppConfigOptions.SectionName)
            .Get<AppConfigOptions>() ?? new AppConfigOptions();

        return new AppConfigOptions
        {
            Endpoint = getEnvironmentVariable(EndpointEnvironmentVariable) ?? string.Empty,
            Label = options.Label
        };
    }
}
