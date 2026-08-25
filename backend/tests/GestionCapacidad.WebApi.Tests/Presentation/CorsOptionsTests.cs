using Microsoft.Extensions.Configuration;
using GestionCapacidad.WebApi.Options;

namespace GestionCapacidad.WebApi.Tests.Presentation;

public sealed class CorsOptionsTests
{
    [Fact]
    public void CorsOptions_DefaultConfiguration_DoesNotAllowAuthorizationHeader()
    {
        CorsOptions options = LoadDefaultCorsOptions();

        Assert.DoesNotContain("Authorization", options.AllowedHeaders);
        Assert.Contains("Content-Type", options.AllowedHeaders);
        Assert.Contains("Idempotency-Key", options.AllowedHeaders);
    }

    private static CorsOptions LoadDefaultCorsOptions()
    {
        string appsettingsPath = FindAppsettingsPath();

        IConfiguration configuration = new ConfigurationBuilder()
            .AddJsonFile(appsettingsPath, optional: false, reloadOnChange: false)
            .Build();

        return configuration
            .GetSection(CorsOptions.SectionName)
            .Get<CorsOptions>() ?? new CorsOptions();
    }

    private static string FindAppsettingsPath()
    {
        string webApiProjectName = typeof(CorsOptions).Assembly.GetName().Name
            ?? "GestionCapacidad.WebApi";

        DirectoryInfo? directory = new(AppContext.BaseDirectory);

        while (directory is not null)
        {
            string generatedProjectCandidate = Path.Combine(
                directory.FullName,
                "src",
                webApiProjectName,
                "appsettings.json");

            if (File.Exists(generatedProjectCandidate))
            {
                return generatedProjectCandidate;
            }

            string templateContentCandidate = Path.Combine(
                directory.FullName,
                "template",
                "content",
                "src",
                webApiProjectName,
                "appsettings.json");

            if (File.Exists(templateContentCandidate))
            {
                return templateContentCandidate;
            }

            directory = directory.Parent;
        }

        throw new FileNotFoundException("Could not locate template/content appsettings.json.");
    }
}
