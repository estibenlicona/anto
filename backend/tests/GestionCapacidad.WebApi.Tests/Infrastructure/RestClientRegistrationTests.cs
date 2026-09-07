using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using GestionCapacidad.Application.ExternalServices.AzureDevOps;
using GestionCapacidad.Application.ExternalServices.CompanyRegistry;
using GestionCapacidad.Infrastructure;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class RestClientRegistrationTests
{
    [Fact]
    public void AddInfrastructure_ResolvesCompanyRegistryClientWhenConfigurationIsPresent()
    {
        IConfiguration configuration = CreateConfiguration();

        using ServiceProvider serviceProvider = new ServiceCollection()
            .AddLogging()
            .AddInfrastructure(configuration)
            .BuildServiceProvider();

        ICompanyRegistryClient client = serviceProvider.GetRequiredService<ICompanyRegistryClient>();

        Assert.NotNull(client);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void AddInfrastructure_ResolvesAzureDevOpsClient_InBothEnvironments(bool isDevelopment)
    {
        IConfiguration configuration = CreateConfiguration();

        using ServiceProvider serviceProvider = new ServiceCollection()
            .AddLogging()
            .AddInfrastructure(configuration, isDevelopment)
            .BuildServiceProvider();

        IAzureDevOpsClient client = serviceProvider.GetRequiredService<IAzureDevOpsClient>();

        Assert.NotNull(client);
    }

    private static IConfiguration CreateConfiguration()
    {
        return new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Persistence:Provider"] = "SqlServer",
                ["Persistence:SqlServerConnectionString"] = "Server=(localdb)\\MSSQLLocalDB;Database=GestionCapacidadWebApi;Trusted_Connection=True;",
                ["HttpClients:CompanyRegistry:BaseAddress"] = "https://example.com/company-registry/",
                ["HttpClients:CompanyRegistry:TimeoutSeconds"] = "30",
                ["HttpClients:CompanyRegistry:Resilience:Preset"] = "TimeoutOnly",
                ["HttpClients:CompanyRegistry:Resilience:Timeout:Seconds"] = "10",
                ["HttpClients:AzureDevOps:BaseAddress"] = "https://example.com/azure-devops/",
                ["HttpClients:AzureDevOps:TimeoutSeconds"] = "30"
            })
            .Build();
    }
}
