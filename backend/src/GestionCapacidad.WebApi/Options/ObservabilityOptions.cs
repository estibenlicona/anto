namespace GestionCapacidad.WebApi.Options;

public sealed class ObservabilityOptions
{
    public const string SectionName = "Observability";

    public string ServiceName { get; init; } = "GestionCapacidad.WebApi";

    public string ServiceVersion { get; init; } = "1.0.0";

    public string OtlpEndpoint { get; init; } = string.Empty;

    public bool ExportToConsole { get; init; } = true;

    public bool ExportTraces { get; init; } = true;

    public bool ExportMetrics { get; init; } = true;

    public bool ExportLogs { get; init; } = true;

    public SensitiveDataMaskingOptions SensitiveDataMasking { get; init; } = new();
}

public sealed class SensitiveDataMaskingOptions
{
    public bool Enabled { get; init; } = true;

    public string Mask { get; init; } = "***MASKED***";

    public string[] PropertyNames { get; init; } =
    [
        "password",
        "pwd",
        "secret",
        "clientSecret",
        "client_secret",
        "token",
        "accessToken",
        "access_token",
        "refreshToken",
        "refresh_token",
        "authorization",
        "apiKey",
        "api_key",
        "subscriptionKey",
        "subscription_key",
        "connectionString",
        "sqlServerConnectionString",
        "mongoDbConnectionString",
        "cardNumber",
        "creditCard",
        "creditCardNumber",
        "debitCard",
        "accountNumber",
        "bankAccount",
        "iban"
    ];
}
