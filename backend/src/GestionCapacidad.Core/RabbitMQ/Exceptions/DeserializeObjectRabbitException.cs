namespace GestionCapacidad.RabbitMQ.Exceptions;

public class DeserializeObjectRabbitException(string message, Exception inner) : Exception(message, inner)
{
}
