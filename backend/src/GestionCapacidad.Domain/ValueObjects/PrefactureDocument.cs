using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>El documento que el proveedor envía con lo que propone cobrar.</summary>
public sealed record PrefactureDocument
{
    /// <summary>Para EF: materializa por propiedades (la imputación es un tipo poseído, y no se puede inyectar por constructor), no por el constructor de abajo, que valida.</summary>
    private PrefactureDocument()
    {
        Currency = Currency.Cop;
        Imputation = Imputation.Empty;
    }

    public PrefactureDocument(string number, DateOnly receivedAt, decimal amount, Currency currency, Imputation imputation)
    {
        ArgumentNullException.ThrowIfNull(currency);
        ArgumentNullException.ThrowIfNull(imputation);

        if (string.IsNullOrWhiteSpace(number))
        {
            throw new DomainException("El número del documento es obligatorio");
        }

        if (amount <= 0)
        {
            throw new DomainException("El monto del documento debe ser mayor que cero");
        }

        Number = number.Trim();
        ReceivedAt = receivedAt;
        Amount = (int)Math.Round(amount, MidpointRounding.AwayFromZero);
        Currency = currency;
        Imputation = imputation;
    }

    public string Number { get; private set; } = string.Empty;

    public DateOnly ReceivedAt { get; private set; }

    /// <summary>Redondeado a pesos: el contrato no maneja centavos.</summary>
    public int Amount { get; private set; }

    public Currency Currency { get; private set; }

    public Imputation Imputation { get; private set; }
}
