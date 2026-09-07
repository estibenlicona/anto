using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// Un ajuste sobre el costo mensual del período (horas extra, ingreso
/// parcial, salida…). El monto es entero y nunca cero: un ajuste de cero no
/// ajusta nada, y los pesos no llevan centavos en este contrato.
/// </summary>
public sealed record BillingAdjustment
{
    /// <summary>Para EF: materializa por propiedades, no por este constructor (el de abajo valida).</summary>
    private BillingAdjustment()
    {
        Reason = AdjustmentReason.Other;
    }

    public BillingAdjustment(int amount, AdjustmentReason reason, string? note)
    {
        ArgumentNullException.ThrowIfNull(reason);

        if (amount == 0)
        {
            throw new DomainException("El monto del ajuste no puede ser cero");
        }

        Amount = amount;
        Reason = reason;
        Note = note ?? string.Empty;
    }

    public int Amount { get; private set; }

    public AdjustmentReason Reason { get; private set; }

    /// <summary>Nunca nula: sin nota se guarda vacía, como llega del contrato.</summary>
    public string Note { get; private set; } = string.Empty;
}
