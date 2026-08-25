using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.ObjectPool;
using RabbitMQ.Client;
using GestionCapacidad.RabbitMQ.Interfaces;

namespace GestionCapacidad.RabbitMQ.Producer;

public static class RabbitServiceCollectionExtensions
{
    /// <summary>
    /// Throw Exception ConnectionRabbitException When Rabbit Conection, Create Channel Fail Or Parameters are invalid
    /// </summary>
    /// <param name="services"></param>
    /// <param name="urlConnection"></param>
    /// <returns></returns>
    public static IServiceCollection AddTuyaRabbitMq(this IServiceCollection services, Uri urlConnection)
    {
        services.AddSingleton<ObjectPoolProvider, DefaultObjectPoolProvider>();
        services.AddSingleton<IPooledObjectPolicy<IChannel>, RabbitModelPooledObjectPolicy>(x => new RabbitModelPooledObjectPolicy(urlConnection));
        services.AddSingleton<IEventBus, ProducerManager>();

        return services;
    }
}