using GestionCapacidad.WebApi.Options;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace GestionCapacidad.WebApi.Extensions;

public sealed record ObservabilityExporterPlan(
    bool ExportTracesToOtlp,
    bool ExportMetricsToOtlp,
    bool ExportLogsToOtlp,
    bool ExportTracesToConsole,
    bool ExportMetricsToConsole,
    bool ExportLogsToConsole);

public static class ObservabilityExtensions
{
    public static IServiceCollection AddObservability(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ObservabilityOptions options = configuration
            .GetSection(ObservabilityOptions.SectionName)
            .Get<ObservabilityOptions>() ?? new ObservabilityOptions();

        ObservabilityExporterPlan exporterPlan = CreateExporterPlan(options);

        OpenTelemetryBuilder openTelemetryBuilder = services.AddOpenTelemetry()
            .ConfigureResource(resource => resource.AddService(
                serviceName: GetServiceName(options),
                serviceVersion: GetServiceVersion(options)));

        if (options.ExportTraces)
        {
            openTelemetryBuilder.WithTracing(tracingBuilder =>
            {
                tracingBuilder
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation();

                if (exporterPlan.ExportTracesToOtlp)
                {
                    tracingBuilder.AddOtlpExporter(exporterOptions =>
                        exporterOptions.Endpoint = new Uri(options.OtlpEndpoint));
                }
                else if (exporterPlan.ExportTracesToConsole)
                {
                    tracingBuilder.AddConsoleExporter();
                }
            });
        }

        if (options.ExportMetrics)
        {
            openTelemetryBuilder.WithMetrics(metricsBuilder =>
            {
                metricsBuilder
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation();

                if (exporterPlan.ExportMetricsToOtlp)
                {
                    metricsBuilder.AddOtlpExporter(exporterOptions =>
                        exporterOptions.Endpoint = new Uri(options.OtlpEndpoint));
                }
                else if (exporterPlan.ExportMetricsToConsole)
                {
                    metricsBuilder.AddConsoleExporter();
                }
            });
        }

        return services;
    }

    public static ObservabilityExporterPlan CreateExporterPlan(ObservabilityOptions options)
    {
        var hasOtlpEndpoint = !string.IsNullOrWhiteSpace(options.OtlpEndpoint);

        return new ObservabilityExporterPlan(
            ExportTracesToOtlp: options.ExportTraces && hasOtlpEndpoint,
            ExportMetricsToOtlp: options.ExportMetrics && hasOtlpEndpoint,
            ExportLogsToOtlp: options.ExportLogs && hasOtlpEndpoint,
            ExportTracesToConsole: options.ExportTraces && !hasOtlpEndpoint && options.ExportToConsole,
            ExportMetricsToConsole: options.ExportMetrics && !hasOtlpEndpoint && options.ExportToConsole,
            ExportLogsToConsole: false);
    }

    private static string GetServiceName(ObservabilityOptions options)
    {
        return string.IsNullOrWhiteSpace(options.ServiceName)
            ? "GestionCapacidad.WebApi"
            : options.ServiceName;
    }

    private static string GetServiceVersion(ObservabilityOptions options)
    {
        return string.IsNullOrWhiteSpace(options.ServiceVersion)
            ? "1.0.0"
            : options.ServiceVersion;
    }
}
