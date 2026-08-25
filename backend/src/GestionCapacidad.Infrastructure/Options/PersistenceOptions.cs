namespace GestionCapacidad.Infrastructure.Options;

public sealed class PersistenceOptions
{
    public const string SectionName = "Persistence";

    public string Provider { get; init; } = "SqlServer";

    public string SqlServerConnectionString { get; init; } = string.Empty;

    public string MongoDbConnectionString { get; init; } = string.Empty;

    public string MongoDbDatabaseName { get; init; } = "GestionCapacidadDb";
}
