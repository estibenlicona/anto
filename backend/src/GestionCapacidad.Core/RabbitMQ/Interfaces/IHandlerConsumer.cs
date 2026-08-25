namespace GestionCapacidad.RabbitMQ.Interfaces;

public interface IHandlerConsumer<in T>
{
    /// <summary>
    /// Event BasicDeliverEventArgs Queue Object Consumer, Return T Object.
    /// Exception: Throw exception when error is not caught "Requeue Message", 
    ///     otherwise use IHandlerConsumerException<T>.NotDeserializedConsume to catch message when object cannot deserialize "Not Requeue Message".
    /// </summary>
    /// <param name="message"></param>
    /// <returns></returns>
    Task Consume(T message);
}