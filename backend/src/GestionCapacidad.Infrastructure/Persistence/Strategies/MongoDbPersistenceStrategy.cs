using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using GestionCapacidad.Infrastructure.Options;

namespace GestionCapacidad.Infrastructure.Persistence.Strategies;

public sealed class MongoDbPersistenceStrategy : IPersistenceStrategy
{
    public PersistenceProvider Provider => PersistenceProvider.MongoDb;

    public void ConfigureDbContext(
        DbContextOptionsBuilder optionsBuilder,
        PersistenceOptions options,
        IServiceProvider serviceProvider)
    {
        if (string.IsNullOrWhiteSpace(options.MongoDbDatabaseName))
        {
            throw new InvalidOperationException(
                "Persistence:MongoDbDatabaseName is required when Persistence:Provider is MongoDb.");
        }

        IMongoClient mongoClient = serviceProvider.GetRequiredService<IMongoClient>();

        optionsBuilder.UseMongoDB(mongoClient, options.MongoDbDatabaseName);
    }
}
