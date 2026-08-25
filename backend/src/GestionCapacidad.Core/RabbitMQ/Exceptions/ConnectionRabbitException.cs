namespace GestionCapacidad.RabbitMQ.Exceptions;

public class ConnectionRabbitException(string message, Exception inner) : Exception(message, inner)
{
}
