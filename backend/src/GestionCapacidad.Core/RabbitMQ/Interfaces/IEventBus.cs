namespace GestionCapacidad.RabbitMQ.Interfaces;

public interface IEventBus
{
    void Publish<T>(T message, string exchangeName, string exchangeType, string routeKey) where T : class;

}