using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Infrastructure.Options;

namespace GestionCapacidad.Infrastructure.Persistence.Strategies;

public sealed class PostgresPersistenceStrategy : IPersistenceStrategy
{
    public PersistenceProvider Provider => PersistenceProvider.Postgres;

    public void ConfigureDbContext(
        DbContextOptionsBuilder optionsBuilder,
        PersistenceOptions options,
        IServiceProvider serviceProvider)
    {
        if (string.IsNullOrWhiteSpace(options.PostgresConnectionString))
        {
            throw new InvalidOperationException(
                "Persistence:PostgresConnectionString is required when Persistence:Provider is Postgres.");
        }

        optionsBuilder.UseNpgsql(options.PostgresConnectionString);
    }
}
