using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>Por qué se objetó una prefactura, y cuándo.</summary>
public sealed record Objection
{
    public string Reason { get; }

    public DateTime ObjectedAtUtc { get; }

    public Objection(string reason, DateTime objectedAtUtc)
    {
        if (string.IsNullOrWhiteSpace(reason))
        {
            throw new DomainException("El motivo de la objeción es obligatorio");
        }

        Reason = reason.Trim();
        ObjectedAtUtc = objectedAtUtc;
    }
}
