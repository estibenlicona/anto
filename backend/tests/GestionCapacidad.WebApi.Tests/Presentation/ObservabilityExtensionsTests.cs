using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using GestionCapacidad.WebApi.Extensions;
using GestionCapacidad.WebApi.Options;

namespace GestionCapacidad.WebApi.Tests.Presentation;

public sealed class ObservabilityExtensionsTests
{
    [Fact]
    public void Options_BindCorrectly()
    {
        IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Observability:ServiceName"] = "Orders.Api",
                ["Observability:ServiceVersion"] = "2.0.0",
                ["Observability:OtlpEndpoint"] = "http://localhost:4317",
                ["Observability:ExportToConsole"] = "false",
                ["Observability:ExportTraces"] = "true",
                ["Observability:ExportMetrics"] = "true",
                ["Observability:ExportLogs"] = "true",
                ["Observability:SensitiveDataMasking:Enabled"] = "true",
                ["Observability:SensitiveDataMasking:Mask"] = "***REDACTED***",
                ["Observability:SensitiveDataMasking:PropertyNames:0"] = "password"
            })
            .Build();

        ObservabilityOptions? options = configuration
            .GetSection(ObservabilityOptions.SectionName)
            .Get<ObservabilityOptions>();

        Assert.NotNull(options);
        Assert.Equal("Orders.Api", options.ServiceName);
        Assert.Equal("2.0.0", options.ServiceVersion);
        Assert.Equal("http://localhost:4317", options.OtlpEndpoint);
        Assert.False(options.ExportToConsole);
        Assert.True(options.ExportTraces);
        Assert.True(options.ExportMetrics);
        Assert.True(options.ExportLogs);
        Assert.True(options.SensitiveDataMasking.Enabled);
        Assert.Equal("***REDACTED***", options.SensitiveDataMasking.Mask);
        Assert.Contains("password", options.SensitiveDataMasking.PropertyNames);
    }

    [Fact]
    public void CreateExporterPlan_UsesConsoleFallbackForTracesAndMetrics_WhenEndpointIsEmpty()
    {
        var options = new ObservabilityOptions
        {
            OtlpEndpoint = "",
            ExportToConsole = true,
            ExportTraces = true,
            ExportMetrics = true,
            ExportLogs = true
        };

        ObservabilityExporterPlan plan = ObservabilityExtensions.CreateExporterPlan(options);

        Assert.False(plan.ExportTracesToOtlp);
        Assert.False(plan.ExportMetricsToOtlp);
        Assert.False(plan.ExportLogsToOtlp);
        Assert.True(plan.ExportTracesToConsole);
        Assert.True(plan.ExportMetricsToConsole);
        Assert.False(plan.ExportLogsToConsole);
    }

    [Fact]
    public void CreateExporterPlan_UsesSameOtlpEndpointForSignals_WhenEndpointIsConfigured()
    {
        var options = new ObservabilityOptions
        {
            OtlpEndpoint = "http://localhost:4317",
            ExportToConsole = true,
            ExportTraces = true,
            ExportMetrics = true,
            ExportLogs = true
        };

        ObservabilityExporterPlan plan = ObservabilityExtensions.CreateExporterPlan(options);

        Assert.True(plan.ExportTracesToOtlp);
        Assert.True(plan.ExportMetricsToOtlp);
        Assert.True(plan.ExportLogsToOtlp);
        Assert.False(plan.ExportTracesToConsole);
        Assert.False(plan.ExportMetricsToConsole);
        Assert.False(plan.ExportLogsToConsole);
    }

    [Fact]
    public void CreateExporterPlan_DisabledSignalsAreNotExported()
    {
        var options = new ObservabilityOptions
        {
            OtlpEndpoint = "http://localhost:4317",
            ExportToConsole = true,
            ExportTraces = false,
            ExportMetrics = true,
            ExportLogs = false
        };

        ObservabilityExporterPlan plan = ObservabilityExtensions.CreateExporterPlan(options);

        Assert.False(plan.ExportTracesToOtlp);
        Assert.True(plan.ExportMetricsToOtlp);
        Assert.False(plan.ExportLogsToOtlp);
        Assert.False(plan.ExportTracesToConsole);
        Assert.False(plan.ExportMetricsToConsole);
        Assert.False(plan.ExportLogsToConsole);
    }

    [Fact]
    public void Observability_DoesNotRegisterOpenTelemetryLoggingProvider()
    {
        IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Observability:OtlpEndpoint"] = "http://localhost:4317",
                ["Observability:ExportTraces"] = "false",
                ["Observability:ExportMetrics"] = "false",
                ["Observability:ExportLogs"] = "true"
            })
            .Build();
        var services = new ServiceCollection();

        services.AddObservability(configuration);

        Assert.DoesNotContain(services, descriptor =>
            string.Equals(
                descriptor.ImplementationType?.FullName,
                "OpenTelemetry.Logs.OpenTelemetryLoggerProvider",
                StringComparison.Ordinal));
    }
}
