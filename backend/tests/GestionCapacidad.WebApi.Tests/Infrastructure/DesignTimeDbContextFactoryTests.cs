using GestionCapacidad.Infrastructure.Persistence;

namespace GestionCapacidad.WebApi.Tests.Infrastructure;

public sealed class DesignTimeDbContextFactoryTests
{
    [Fact]
    public void CreateDbContext_WithNoConfigurationPresent_BuildsTheContextWithADesignTimeConnectionString()
    {
        // Generar o comparar una migración no toca la base: sin ninguna
        // configuración presente, la fábrica no debe fallar ni intentar
        // conectarse a nada.
        var factory = new DesignTimeDbContextFactory();

        using ApplicationDbContext dbContext = factory.CreateDbContext([]);

        Assert.NotNull(dbContext);
        Assert.NotNull(dbContext.Model);
    }
}
