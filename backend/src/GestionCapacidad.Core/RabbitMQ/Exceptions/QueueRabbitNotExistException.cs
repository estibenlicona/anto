namespace GestionCapacidad.RabbitMQ.Exceptions;

public class QueueRabbitNotExistException(string message, Exception inner) : Exception(message, inner)
{
}
