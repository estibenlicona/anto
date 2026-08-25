using GestionCapacidad.Infrastructure.Options;

namespace GestionCapacidad.Infrastructure.Persistence.Strategies;

public sealed class PersistenceStrategyFactory(IEnumerable<IPersistenceStrategy> strategies)
{
    private readonly Dictionary<PersistenceProvider, IPersistenceStrategy> _strategies = strategies.ToDictionary(strategy => strategy.Provider);

    public IPersistenceStrategy Resolve(PersistenceOptions options)
    {
        if (!Enum.TryParse(options.Provider, ignoreCase: true, out PersistenceProvider provider))
        {
            throw new InvalidOperationException(
                $"Persistence provider '{options.Provider}' is not supported. Supported providers: SqlServer, MongoDb.");
        }

        return !_strategies.TryGetValue(provider, out IPersistenceStrategy? strategy)
            ? throw new InvalidOperationException(
                $"Persistence provider '{provider}' is not registered.")
            : strategy;
    }
}
