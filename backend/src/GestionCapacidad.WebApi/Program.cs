using GestionCapacidad.Application;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.WebApi.Extensions;
using GestionCapacidad.WebApi.Settings;
using Serilog;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.AddOptionalAzureAppConfiguration();
SerilogBootstrapper.Configure(builder);

builder.Services.AddApplicationOptions(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddEndpointDefinitions();
builder.Services.AddSwaggerDocumentation(builder.Configuration);
builder.Services.AddApiVersioningDocumentation();
builder.Services.AddCorsPolicy(builder.Configuration);
builder.Services.AddConfiguredHealthChecks(builder.Configuration);
builder.Services.AddMemoryCache();
builder.Services.AddObservability(builder.Configuration);

try
{
    WebApplication app = builder.Build();
    app.Logger.LogInformation("Starting GestionCapacidad.WebApi");

    app.UseGlobalErrorHandler();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwaggerDocumentation();
    }

    app.UseHttpsRedirection();
    app.UseCors(CorsExtensions.DefaultCorsPolicy);
    app.UseIdempotency();

    app.MapEndpointDefinitions();
    app.MapConfiguredHealthChecks();

    app.Run();
}
catch (Exception exception)
{
    Log.Fatal(exception, "GestionCapacidad.WebApi terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

