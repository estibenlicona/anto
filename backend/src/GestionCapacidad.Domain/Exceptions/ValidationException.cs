namespace GestionCapacidad.Domain.Exceptions;

public sealed class ValidationException(IEnumerable<string> errors) : DomainException("One or more validation errors occurred.")
{
    public IReadOnlyCollection<string> Errors { get; } = [.. errors];
}
