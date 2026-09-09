using GestionCapacidad.Application;
using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Infrastructure;
using GestionCapacidad.Infrastructure.Persistence;
using GestionCapacidad.WebApi.Extensions;
using GestionCapacidad.WebApi.Settings;
using Serilog;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.AddOptionalAzureAppConfiguration();
SerilogBootstrapper.Configure(builder);

builder.Services.AddApplicationOptions(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment.IsDevelopment());
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

    // Sólo en Development: un arranque no es el momento de descubrir que una
    // migración bloquea una tabla en producción — eso lo aplica el pipeline.
    // IsRelational() de más: con InMemory (que no tiene migraciones) el
    // esquema lo crea el sembrador con EnsureCreated.
    if (app.Environment.IsDevelopment())
    {
        await using AsyncServiceScope migrationScope = app.Services.CreateAsyncScope();
        ApplicationDbContext migrationContext =
            migrationScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (migrationContext.Database.IsRelational())
        {
            await migrationContext.Database.MigrateAsync();
        }
    }

    // Esquema y semillas de desarrollo: InMemory usa EnsureCreated (sin
    // migraciones); Postgres ya quedó migrado arriba.
    await DevelopmentDataSeeder.SeedAsync(app.Services);

    // Después de sembrar: la versión 1 del modelo se arma desde los parámetros
    // de fila única y le pone su versión a las evaluaciones ya guardadas, así
    // que necesita que esas evaluaciones existan. Es idempotente — con un
    // modelo ya creado, no hace nada.
    await EstimationModelMigrator.RunAsync(app.Services);

    // Y en desarrollo, el modelo queda con las tres etapas visibles.
    await EstimationModelDevelopmentSeeder.SeedAsync(app.Services);

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

