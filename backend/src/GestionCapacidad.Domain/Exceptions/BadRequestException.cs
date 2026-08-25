namespace GestionCapacidad.Domain.Exceptions;

public sealed class BadRequestException(string message) : DomainException(message)
{
}
