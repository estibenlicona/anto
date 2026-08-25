using System.Diagnostics;
using GestionCapacidad.WebApi.Logging;
using Serilog;
using Serilog.Core;
using Serilog.Events;

namespace GestionCapacidad.WebApi.Tests.Presentation;

public sealed class TraceContextEnricherTests
{
    [Fact]
    public void SerilogLogs_IncludeTraceIdAndSpanId_WhenActivityIsActive()
    {
        var sink = new CollectingSink();
        using Serilog.Core.Logger logger = new LoggerConfiguration()
            .Enrich.With<TraceContextEnricher>()
            .WriteTo.Sink(sink)
            .CreateLogger();

        using Activity activity = new("trace-test");
        activity.Start();

        logger.Information("Trace correlated log");

        LogEvent logEvent = Assert.Single(sink.Events);
        Assert.True(logEvent.Properties.TryGetValue("TraceId", out LogEventPropertyValue? traceId));
        Assert.True(logEvent.Properties.TryGetValue("SpanId", out LogEventPropertyValue? spanId));
        Assert.Equal(activity.TraceId.ToString(), AssertScalarString(traceId));
        Assert.Equal(activity.SpanId.ToString(), AssertScalarString(spanId));
    }

    private static string AssertScalarString(LogEventPropertyValue value)
    {
        ScalarValue scalarValue = Assert.IsType<ScalarValue>(value);
        return Assert.IsType<string>(scalarValue.Value);
    }

    private sealed class CollectingSink : ILogEventSink
    {
        public List<LogEvent> Events { get; } = [];

        public void Emit(LogEvent logEvent) => Events.Add(logEvent);
    }
}
