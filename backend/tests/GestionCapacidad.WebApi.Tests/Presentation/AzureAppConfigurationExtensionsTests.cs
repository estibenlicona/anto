using Microsoft.Extensions.Configuration;
using GestionCapacidad.WebApi.Extensions;
using GestionCapacidad.WebApi.Options;
using WebApiAzureAppConfigurationExtensions = GestionCapacidad.WebApi.Extensions.AzureAppConfigurationExtensions;

namespace GestionCapacidad.WebApi.Tests.Presentation;

public sealed class AzureAppConfigurationExtensionsTests
{
    [Fact]
    public void ResolveConnectionMode_ReturnsDisabled_WhenConfigurationIsDisabled()
    {
        var options = new AzureAppConfigurationOptions { Enabled = false };

        AzureAppConfigurationConnectionMode mode = WebApiAzureAppConfigurationExtensions.ResolveConnectionMode(options);

        Assert.Equal(AzureAppConfigurationConnectionMode.Disabled, mode);
    }

    [Fact]
    public void ResolveConnectionMode_Throws_WhenEnabledWithoutEndpointOrConnectionString()
    {
        var options = new AzureAppConfigurationOptions { Enabled = true };

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() =>
            WebApiAzureAppConfigurationExtensions.ResolveConnectionMode(options));

        Assert.Contains("AzureAppConfiguration is enabled", exception.Message);
    }

    [Fact]
    public void ResolveConnectionMode_PrefersManagedIdentity_WhenEndpointAndConnectionStringAreConfigured()
    {
        var options = new AzureAppConfigurationOptions
        {
            Enabled = true,
            Endpoint = "https://example.azconfig.io",
            UseManagedIdentity = true,
            ConnectionString = "Endpoint=https://example.azconfig.io;Id=id;Secret=secret"
        };

        AzureAppConfigurationConnectionMode mode = WebApiAzureAppConfigurationExtensions.ResolveConnectionMode(options);

        Assert.Equal(AzureAppConfigurationConnectionMode.ManagedIdentity, mode);
    }

    [Fact]
    public void ResolveOptions_UsesEnvironmentVariablesOnly_ForEndpointAndConnectionString()
    {
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AzureAppConfiguration:Enabled"] = "true",
                ["AzureAppConfiguration:Endpoint"] = "https://appsettings.azconfig.io",
                ["AzureAppConfiguration:UseManagedIdentity"] = "false",
                ["AzureAppConfiguration:ConnectionString"] = "Endpoint=https://appsettings.azconfig.io;Id=id;Secret=secret",
                ["AzureAppConfiguration:Label"] = "production"
            })
            .Build();

        var environmentVariables = new Dictionary<string, string?>
        {
            [WebApiAzureAppConfigurationExtensions.EndpointEnvironmentVariable] = "https://environment.azconfig.io",
            [WebApiAzureAppConfigurationExtensions.ConnectionStringEnvironmentVariable] =
                "Endpoint=https://environment.azconfig.io;Id=id;Secret=secret"
        };

        AzureAppConfigurationOptions options = WebApiAzureAppConfigurationExtensions.ResolveOptions(
            configuration,
            environmentVariables.GetValueOrDefault);

        Assert.True(options.Enabled);
        Assert.Equal("https://environment.azconfig.io", options.Endpoint);
        Assert.False(options.UseManagedIdentity);
        Assert.Equal("Endpoint=https://environment.azconfig.io;Id=id;Secret=secret", options.ConnectionString);
        Assert.Equal("production", options.Label);
    }

    [Fact]
    public void ResolveOptions_IgnoresAppsettingsLinks_WhenEnvironmentVariablesAreMissing()
    {
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AzureAppConfiguration:Enabled"] = "true",
                ["AzureAppConfiguration:Endpoint"] = "https://appsettings.azconfig.io",
                ["AzureAppConfiguration:ConnectionString"] = "Endpoint=https://appsettings.azconfig.io;Id=id;Secret=secret"
            })
            .Build();

        AzureAppConfigurationOptions options = WebApiAzureAppConfigurationExtensions.ResolveOptions(
            configuration,
            _ => null);

        Assert.Empty(options.Endpoint);
        Assert.Empty(options.ConnectionString);
    }
}
