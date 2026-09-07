using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using GestionCapacidad.WebApi.Extensions;
using GestionCapacidad.WebApi.Options;
using WebApiAzureAppConfigurationExtensions = GestionCapacidad.WebApi.Extensions.AzureAppConfigurationExtensions;

namespace GestionCapacidad.WebApi.Tests.Presentation;

public sealed class AzureAppConfigurationExtensionsTests
{
    [Fact]
    public void AddOptionalAzureAppConfiguration_InDevelopment_NeverTouchesAzure()
    {
        // En Development la cadena de conexión sale de los User Secrets; la
        // aplicación no debe intentar alcanzar Azure ni exigir un endpoint.
        WebApplicationBuilder builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            EnvironmentName = "Development",
        });

        WebApplicationBuilder result = builder.AddOptionalAzureAppConfiguration();

        Assert.Same(builder, result);
    }

    [Theory]
    [InlineData("Staging")]
    [InlineData("Production")]
    public void AddOptionalAzureAppConfiguration_OutsideDevelopmentWithoutEndpoint_Throws(string environmentName)
    {
        // Certificación y producción se comportan igual: fuera de
        // Development no hay escape, App Configuration siempre debe ser
        // alcanzable.
        WebApplicationBuilder builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            EnvironmentName = environmentName,
        });

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() =>
            builder.AddOptionalAzureAppConfiguration());

        Assert.Contains(WebApiAzureAppConfigurationExtensions.EndpointEnvironmentVariable, exception.Message);
    }

    [Fact]
    public void ResolveOptions_ReadsTheEndpointOnlyFromTheEnvironmentVariable()
    {
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AzureAppConfiguration:Endpoint"] = "https://appsettings.azconfig.io",
                ["AzureAppConfiguration:Label"] = "production",
            })
            .Build();

        var environmentVariables = new Dictionary<string, string?>
        {
            [WebApiAzureAppConfigurationExtensions.EndpointEnvironmentVariable] = "https://environment.azconfig.io",
        };

        AzureAppConfigurationOptions options = WebApiAzureAppConfigurationExtensions.ResolveOptions(
            configuration,
            environmentVariables.GetValueOrDefault);

        Assert.Equal("https://environment.azconfig.io", options.Endpoint);
        Assert.Equal("production", options.Label);
    }

    [Fact]
    public void ResolveOptions_IgnoresTheAppsettingsEndpoint_WhenTheEnvironmentVariableIsMissing()
    {
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AzureAppConfiguration:Endpoint"] = "https://appsettings.azconfig.io",
            })
            .Build();

        AzureAppConfigurationOptions options = WebApiAzureAppConfigurationExtensions.ResolveOptions(
            configuration,
            _ => null);

        Assert.Empty(options.Endpoint);
    }
}
