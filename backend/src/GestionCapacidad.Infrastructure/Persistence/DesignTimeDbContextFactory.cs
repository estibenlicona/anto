using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace GestionCapacidad.Infrastructure.Persistence;

/// <summary>
/// Construye el contexto para las herramientas de `dotnet ef`, que necesitan
/// leer el modelo sin levantar la aplicación ni exigir el secreto.
///
/// Generar o comparar una migración no toca la base de datos, así que cuando
/// no hay cadena configurada se usa una de diseño que nunca se conecta.
/// Cuando sí hay una —por ejemplo, con el secreto local puesto— se usa esa,
/// para que `dotnet ef database update` funcione contra la base real.
/// </summary>
public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    private const string DesignTimeConnectionString =
        "Host=localhost;Database=gestioncapacidad_design;Username=postgres;Password=design-time-only";

    /// <summary>
    /// El mismo id que declara <c>&lt;UserSecretsId&gt;</c> en el proyecto
    /// WebApi. Se referencia por cadena y no con <c>AddUserSecrets&lt;T&gt;</c>
    /// porque esa sobrecarga exige el atributo en el propio ensamblado, y los
    /// secretos son del proyecto de arranque, no de Infrastructure.
    /// </summary>
    private const string UserSecretsId = "14806348-0ddf-44f8-a61d-d38eb3ebf1d1";

    public ApplicationDbContext CreateDbContext(string[] args)
    {
        IConfiguration configuration = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddUserSecrets(UserSecretsId, reloadOnChange: false)
            .AddEnvironmentVariables()
            .Build();

        string connectionString = configuration["Persistence:PostgresConnectionString"] is { Length: > 0 } configured
            ? configured
            : DesignTimeConnectionString;

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
