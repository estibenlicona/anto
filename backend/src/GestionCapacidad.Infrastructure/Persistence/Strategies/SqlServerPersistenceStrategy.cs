using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Infrastructure.Options;

namespace GestionCapacidad.Infrastructure.Persistence.Strategies;

public sealed class SqlServerPersistenceStrategy : IPersistenceStrategy
{
    public PersistenceProvider Provider => PersistenceProvider.SqlServer;

    public void ConfigureDbContext(
        DbContextOptionsBuilder optionsBuilder,
        PersistenceOptions options,
        IServiceProvider serviceProvider)
    {
        if (string.IsNullOrWhiteSpace(options.SqlServerConnectionString))
        {
            throw new InvalidOperationException(
                "Persistence:SqlServerConnectionString is required when Persistence:Provider is SqlServer.");
        }

        optionsBuilder.UseSqlServer(options.SqlServerConnectionString);
    }
}
