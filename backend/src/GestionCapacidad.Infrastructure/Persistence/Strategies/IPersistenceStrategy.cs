using Microsoft.EntityFrameworkCore;
using GestionCapacidad.Infrastructure.Options;

namespace GestionCapacidad.Infrastructure.Persistence.Strategies;

public interface IPersistenceStrategy
{
    PersistenceProvider Provider { get; }

    void ConfigureDbContext(
        DbContextOptionsBuilder optionsBuilder,
        PersistenceOptions options,
        IServiceProvider serviceProvider);
}
