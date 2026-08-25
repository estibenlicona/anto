namespace GestionCapacidad.WebApi.Options;

public sealed class CorsOptions
{
    public const string SectionName = "Cors";

    public string[] AllowedOrigins { get; init; } = [];

    public string[] AllowedMethods { get; init; } = [];

    public string[] AllowedHeaders { get; init; } = [];
}
