namespace GestionCapacidad.WebApi.Options;

public sealed class AzureAppConfigurationOptions
{
    public const string SectionName = "AzureAppConfiguration";

    public string Endpoint { get; init; } = string.Empty;

    public string Label { get; init; } = string.Empty;
}
