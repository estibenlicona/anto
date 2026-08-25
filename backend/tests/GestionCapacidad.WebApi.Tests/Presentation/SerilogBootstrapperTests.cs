using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using GestionCapacidad.WebApi.Settings;
using Serilog;

namespace GestionCapacidad.WebApi.Tests.Presentation;

public sealed class SerilogBootstrapperTests
{
    [Fact]
    public void SerilogBootstrapper_ConfiguresOtlpSinkWhenEndpointIsSet()
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder();
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Observability:ServiceName"] = "Orders.Api",
            ["Observability:ServiceVersion"] = "2.0.0",
            ["Observability:OtlpEndpoint"] = "http://localhost:4317",
            ["Observability:ExportToConsole"] = "false",
            ["Observability:ExportLogs"] = "true",
            ["Observability:SensitiveDataMasking:Enabled"] = "true"
        });

        Exception? exception = Record.Exception(() => SerilogBootstrapper.Configure(builder));

        Assert.Null(exception);
        Log.CloseAndFlush();
    }
}
