using Azure.Identity;
using Microsoft.Extensions.Configuration.AzureAppConfiguration;
using AppConfigOptions = GestionCapacidad.WebApi.Options.AzureAppConfigurationOptions;

namespace GestionCapacidad.WebApi.Extensions;

public enum AzureAppConfigurationConnectionMode
{
    Disabled,
    ManagedIdentity,
    ConnectionString
}

public static class AzureAppConfigurationExtensions
{
    public const string EndpointEnvironmentVariable = "AzureAppConfiguration__Endpoint";

    public const string ConnectionStringEnvironmentVariable = "AzureAppConfiguration__ConnectionString";

    public static WebApplicationBuilder AddOptionalAzureAppConfiguration(this WebApplicationBuilder builder)
    {
        AppConfigOptions options = ResolveOptions(builder.Configuration);

        AzureAppConfigurationConnectionMode mode = ResolveConnectionMode(options);
        if (mode == AzureAppConfigurationConnectionMode.Disabled)
        {
            return builder;
        }

        builder.Configuration.AddAzureAppConfiguration(azureOptions =>
        {
            if (mode == AzureAppConfigurationConnectionMode.ManagedIdentity)
            {
                azureOptions.Connect(new Uri(options.Endpoint), new DefaultAzureCredential());
            }
            else
            {
                azureOptions.Connect(options.ConnectionString);
            }

            if (!string.IsNullOrWhiteSpace(options.Label))
            {
                azureOptions.Select(KeyFilter.Any, options.Label);
            }
        });

        return builder;
    }

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
            Enabled = options.Enabled,
            Endpoint = getEnvironmentVariable(EndpointEnvironmentVariable) ?? string.Empty,
            UseManagedIdentity = options.UseManagedIdentity,
            ConnectionString = getEnvironmentVariable(ConnectionStringEnvironmentVariable) ?? string.Empty,
            Label = options.Label
        };
    }

    public static AzureAppConfigurationConnectionMode ResolveConnectionMode(
        AppConfigOptions options)
    {
        if (!options.Enabled)
        {
            return AzureAppConfigurationConnectionMode.Disabled;
        }

        if (options.UseManagedIdentity && !string.IsNullOrWhiteSpace(options.Endpoint))
        {
            return AzureAppConfigurationConnectionMode.ManagedIdentity;
        }

        if (!string.IsNullOrWhiteSpace(options.ConnectionString))
        {
            return AzureAppConfigurationConnectionMode.ConnectionString;
        }

        return !string.IsNullOrWhiteSpace(options.Endpoint)
            ? AzureAppConfigurationConnectionMode.ManagedIdentity
            : throw new InvalidOperationException(
                "AzureAppConfiguration is enabled, but neither AzureAppConfiguration__Endpoint nor AzureAppConfiguration__ConnectionString is configured.");
    }
}
