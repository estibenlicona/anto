using Microsoft.Extensions.ObjectPool;
using System.Text.Json;
using RabbitMQ.Client;
using System.Text;
using GestionCapacidad.RabbitMQ.Exceptions;
using GestionCapacidad.RabbitMQ.Interfaces;

namespace GestionCapacidad.RabbitMQ.Producer;

public class ProducerManager(IPooledObjectPolicy<IChannel> objectPolicy) : IEventBus
{
    private readonly DefaultObjectPool<IChannel> _objectPool = new(objectPolicy, Environment.ProcessorCount * 2);

    /// <summary>
    /// Exchange Type (direct, topic, fanout)
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="message"></param>
    /// <param name="exchangeName"></param>
    /// <param name="exchangeType"></param>
    /// <param name="routeKey"></param>
    public void Publish<T>(T message, string exchangeName, string exchangeType, string routeKey)
        where T : class
    {
        PublishAsync(message, exchangeName, exchangeType, routeKey).GetAwaiter().GetResult();
    }

    /// <summary>
    /// Exchange Type (direct, topic, fanout)
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="message"></param>
    /// <param name="exchangeName"></param>
    /// <param name="exchangeType"></param>
    /// <param name="routeKey"></param>
    public async Task PublishAsync<T>(T message, string exchangeName, string exchangeType, string routeKey)
        where T : class
    {
        ValidateExchange(exchangeType);

        if (message == null)
            return;

        IChannel channel = _objectPool.Get();

        try
        {
            await channel.ExchangeDeclareAsync(exchangeName, exchangeType, true, false, null);

            var sendBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));

            var properties = new BasicProperties
            {
                Persistent = true
            };

            await channel.BasicPublishAsync(exchangeName, routeKey, true, properties, sendBytes);
        }
        catch (Exception ex)
        {
            var msg = channel.IsClosed
                ? channel.CloseReason?.ReplyText ?? "Channel closed unexpectedly"
                : "The Channel Is Open Conection Ok,  Validate Publish Message and Parameters RabbitMQ";
            throw new ConnectionRabbitException(msg, ex);
        }
        finally
        {
            _objectPool.Return(channel);
        }
    }

    private static void ValidateExchange(string exchangeType)
    {
        if (exchangeType != ExchangeType.Fanout && exchangeType != ExchangeType.Direct && exchangeType != ExchangeType.Topic)
            throw new ExchangeTypeException("El tipo de exchange no es permitido, debe escoger  fanout, direct � topic");
    }

}
