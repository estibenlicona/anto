namespace GestionCapacidad.Domain.Exceptions;

public sealed class ExternalServiceUnavailableException(string message) : DomainException(message)
{
}
