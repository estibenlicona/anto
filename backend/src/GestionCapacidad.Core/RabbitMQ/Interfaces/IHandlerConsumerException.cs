namespace GestionCapacidad.RabbitMQ.Interfaces;

public interface IHandlerConsumerException<in T> : IHandlerConsumer<T>
{
    void NotDeserializedConsume(byte[] message, Exception ex);
}