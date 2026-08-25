using GestionCapacidad.WebApi.Logging;
using GestionCapacidad.WebApi.Options;
using Serilog;
using Serilog.Enrichers.Span;
using Serilog.Enrichers.Sensitive;

namespace GestionCapacidad.WebApi.Settings;

public static class SerilogBootstrapper
{
    public static void Configure(WebApplicationBuilder builder)
    {
        ObservabilityOptions observabilityOptions = builder.Configuration
            .GetSection(ObservabilityOptions.SectionName)
            .Get<ObservabilityOptions>() ?? new ObservabilityOptions();

        var applicationName = string.IsNullOrWhiteSpace(observabilityOptions.ServiceName)
            ? builder.Environment.ApplicationName
            : observabilityOptions.ServiceName;

        builder.Logging.ClearProviders();

        builder.Host.UseSerilog((context, _, loggerConfiguration) =>
        {
            loggerConfiguration
                .ReadFrom.Configuration(context.Configuration)
                .Enrich.FromLogContext()
                .Enrich.WithSpan()
                .Enrich.With<TraceContextEnricher>()
                .Enrich.WithProperty("EnvironmentName", context.HostingEnvironment.EnvironmentName)
                .Enrich.WithProperty("ApplicationName", applicationName);

            if (observabilityOptions.SensitiveDataMasking.Enabled)
            {
                ConfigureSensitiveDataMasking(loggerConfiguration, observabilityOptions.SensitiveDataMasking);
            }

            loggerConfiguration.WriteTo.Console();

            if (!string.IsNullOrWhiteSpace(observabilityOptions.OtlpEndpoint))
            {
                ConfigureOpenTelemetry(loggerConfiguration, observabilityOptions, applicationName);
            }
        });
    }

    private static void ConfigureSensitiveDataMasking(
        LoggerConfiguration loggerConfiguration,
        SensitiveDataMaskingOptions maskingOptions)
    {
        loggerConfiguration.Enrich.WithSensitiveDataMasking(options =>
        {
            options.MaskValue = GetMaskValue(maskingOptions);

            foreach (string propertyName in GetSensitivePropertyNames(maskingOptions))
            {
                options.MaskProperties.Add(MaskProperty.WithDefaults(propertyName));
            }

            options.MaskingOperators.Add(new BearerTokenMaskingOperator());
            options.MaskingOperators.Add(new QueryStringSecretMaskingOperator());
            options.MaskingOperators.Add(new ConnectionStringSecretMaskingOperator());
        });
    }

    private static void ConfigureOpenTelemetry(
        LoggerConfiguration loggerConfiguration,
        ObservabilityOptions observabilityOptions,
        string applicationName)
    {
        loggerConfiguration.WriteTo.OpenTelemetry(
            endpoint: observabilityOptions.OtlpEndpoint,
            resourceAttributes: new Dictionary<string, object>
            {
                ["service.name"] = applicationName,
                ["service.version"] = string.IsNullOrWhiteSpace(observabilityOptions.ServiceVersion)
                    ? "1.0.0"
                    : observabilityOptions.ServiceVersion
            },
            restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Warning);
    }

    private static string GetMaskValue(SensitiveDataMaskingOptions options)
        => string.IsNullOrWhiteSpace(options.Mask) ? "***MASKED***" : options.Mask;

    private static IEnumerable<string> GetSensitivePropertyNames(SensitiveDataMaskingOptions options)
        => options.PropertyNames
            .Where(propertyName => !string.IsNullOrWhiteSpace(propertyName))
            .Select(propertyName => propertyName.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase);
}
