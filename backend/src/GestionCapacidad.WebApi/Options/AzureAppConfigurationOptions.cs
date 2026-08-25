namespace GestionCapacidad.WebApi.Options;

public sealed class AzureAppConfigurationOptions
{
    public const string SectionName = "AzureAppConfiguration";

    public bool Enabled { get; init; }

    public string Endpoint { get; init; } = string.Empty;

    public bool UseManagedIdentity { get; init; } = true;

    public string ConnectionString { get; init; } = string.Empty;

    public string Label { get; init; } = string.Empty;
}
