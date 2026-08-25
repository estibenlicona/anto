using System.Globalization;
using GestionCapacidad.WebApi.Logging;
using GestionCapacidad.WebApi.Options;
using Serilog;
using Serilog.Core;
using Serilog.Enrichers.Sensitive;
using Serilog.Events;

namespace GestionCapacidad.WebApi.Tests.Presentation;

public sealed class SensitiveDataMaskingTests
{
    [Theory]
    [InlineData("password", "visible-password")]
    [InlineData("clientSecret", "visible-client-secret")]
    [InlineData("accessToken", "visible-access-token")]
    [InlineData("authorization", "Bearer visible-authorization-token")]
    [InlineData("mongoDbConnectionString", "mongodb://user:visible-password@example")]
    [InlineData("creditCardNumber", "4111111111111111")]
    [InlineData("bankAccount", "1234567890123456")]
    [InlineData("iban", "GB82WEST12345698765432")]
    public void SensitiveDataMasking_MasksSensitivePropertyNames(string propertyName, string rawValue)
    {
        var sink = new CollectingSink();
        using Serilog.Core.Logger logger = CreateLogger(sink);

        logger.ForContext(propertyName, rawValue).Information("Testing sensitive property masking");

        string rendered = sink.RenderedOutput();
        Assert.DoesNotContain(rawValue, rendered);
        Assert.Contains("***MASKED***", rendered);
    }

    [Theory]
    [InlineData("companyName", "Contoso")]
    [InlineData("identificationNumber", "123456")]
    public void SensitiveDataMasking_DoesNotMaskNonSensitivePropertyNames(string propertyName, string propertyValue)
    {
        var sink = new CollectingSink();
        using Serilog.Core.Logger logger = CreateLogger(sink);

        logger.ForContext(propertyName, propertyValue).Information("Testing non-sensitive property masking");

        string rendered = sink.RenderedOutput();
        Assert.Contains(propertyValue, rendered);
    }

    [Theory]
    [InlineData("credit-card-like value 4111111111111111", "4111111111111111")]
    [InlineData("IBAN-like value GB82WEST12345698765432", "GB82WEST12345698765432")]
    [InlineData("Authorization: Bearer abc.def.ghi", "abc.def.ghi")]
    [InlineData("client_secret=my-secret&scope=x", "my-secret")]
    [InlineData("Server=tcp:db;Password=my-db-secret;User Id=app;", "my-db-secret")]
    public void SensitiveDataMasking_MasksSensitivePatternsInRenderedOutput(string text, string rawValue)
    {
        var sink = new CollectingSink();
        using Serilog.Core.Logger logger = CreateLogger(sink);

        logger.Information("Payload {Payload}", text);

        string rendered = sink.RenderedOutput();
        Assert.DoesNotContain(rawValue, rendered);
        Assert.Contains("***MASKED***", rendered);
    }

    private static Serilog.Core.Logger CreateLogger(ILogEventSink sink)
    {
        var maskingOptions = new SensitiveDataMaskingOptions();

        return new LoggerConfiguration()
            .Enrich.WithSensitiveDataMasking(options =>
            {
                options.MaskValue = maskingOptions.Mask;

                foreach (string propertyName in maskingOptions.PropertyNames)
                {
                    options.MaskProperties.Add(MaskProperty.WithDefaults(propertyName));
                }

                options.MaskingOperators.Add(new BearerTokenMaskingOperator());
                options.MaskingOperators.Add(new QueryStringSecretMaskingOperator());
                options.MaskingOperators.Add(new ConnectionStringSecretMaskingOperator());
            })
            .WriteTo.Sink(sink)
            .CreateLogger();
    }

    private sealed class CollectingSink : ILogEventSink
    {
        private readonly List<LogEvent> _events = [];

        public void Emit(LogEvent logEvent) => _events.Add(logEvent);

        public string RenderedOutput()
        {
            return string.Join(
                Environment.NewLine,
                _events.Select(logEvent =>
                    logEvent.RenderMessage(CultureInfo.InvariantCulture) +
                    " " +
                    string.Join(" ", logEvent.Properties.Select(property => $"{property.Key}={property.Value}"))));
        }
    }
}
