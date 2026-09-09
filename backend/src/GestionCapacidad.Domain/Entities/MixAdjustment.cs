using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Cuántos puntos porcentuales suma o resta un modificador a una capacidad.
/// Los ajustes de un modificador suman cero entre todos: el mix se reparte, no
/// se agranda.
/// </summary>
public sealed class MixAdjustment
{
    private MixAdjustment()
    {
    }

    public MixAdjustment(int position, string capabilityKey, decimal points)
    {
        if (position < 0)
        {
            throw new DomainException("La posición del ajuste no puede ser negativa.");
        }

        if (string.IsNullOrWhiteSpace(capabilityKey))
        {
            throw new DomainException("El ajuste tiene que apuntar a una capacidad.");
        }

        if (capabilityKey.Trim().Length > 50)
        {
            throw new DomainException("El id de la capacidad no puede superar 50 caracteres.");
        }

        if (points is < -100m or > 100m)
        {
            throw new DomainException(
                $"El ajuste de {capabilityKey.Trim()} debe estar entre -100 y 100 puntos. Recibido: {points}.");
        }

        Position = position;
        CapabilityKey = capabilityKey.Trim();
        Points = points;
    }

    public int Position { get; private set; }

    public string CapabilityKey { get; private set; } = string.Empty;

    /// <summary>Puntos porcentuales, con signo.</summary>
    public decimal Points { get; private set; }
}
