using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

/// <summary>
/// Si esto falla, alguien cambió el modelo (agregó una propiedad, una tabla,
/// una relación) sin generar la migración correspondiente. Sin este test, el
/// código compila, los demás tests pasan, y la base real se queda sin la
/// columna hasta que alguien lo nota en producción.
///
/// La comparación es contra el snapshot de <c>Migrations/</c> y no exige una
/// conexión real: es la misma verificación que hace <c>dotnet ef migrations
/// add</c> para decidir si hay algo que generar.
/// </summary>
public sealed class PendingModelChangesTests
{
    [Fact]
    public void Model_HasNoChangesPendingAMigration()
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(
            "Host=localhost;Database=gestioncapacidad_design;Username=postgres;Password=design-time-only",
            npgsql => npgsql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));

        using var dbContext = new ApplicationDbContext(optionsBuilder.Options);

        Assert.False(
            dbContext.Database.HasPendingModelChanges(),
            "El modelo tiene cambios sin migrar. Corre 'dotnet ef migrations add <Nombre>' antes de continuar.");
    }
}
