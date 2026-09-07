using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Infrastructure.Options;

namespace GestionCapacidad.Infrastructure.Persistence.Strategies;

/// <summary>
/// Persistencia en memoria para desarrollo y demos: la API corre sin SQL ni
/// Mongo, con el esquema creado code-first desde las EntityConfigurations y
/// las semillas de <see cref="DevelopmentDataSeeder"/>. Los datos viven lo
/// que viva el proceso.
/// </summary>
public sealed class InMemoryPersistenceStrategy : IPersistenceStrategy
{
    public PersistenceProvider Provider => PersistenceProvider.InMemory;

    public void ConfigureDbContext(
        DbContextOptionsBuilder optionsBuilder,
        PersistenceOptions options,
        IServiceProvider serviceProvider)
    {
        optionsBuilder.UseInMemoryDatabase(options.InMemoryDatabaseName);
    }
}
