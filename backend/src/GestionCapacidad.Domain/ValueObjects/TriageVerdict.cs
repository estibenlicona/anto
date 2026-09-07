using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// Qué exige el tamizaje de una iniciativa: acompañamiento obligatorio,
/// recomendado, o vía rápida. Lo produce el motor a partir de las seis
/// respuestas del tamizaje, no lo elige nadie a mano.
/// </summary>
public sealed record TriageVerdict
{
    /// <summary>Alguna crítica marcada, o tres o más síes.</summary>
    public static readonly TriageVerdict Required = new("Required");

    /// <summary>Al menos un sí, ninguna crítica y menos de tres.</summary>
    public static readonly TriageVerdict Recommended = new("Recommended");

    /// <summary>Ningún sí.</summary>
    public static readonly TriageVerdict FastTrack = new("FastTrack");

    public static readonly IReadOnlyCollection<TriageVerdict> ValidValues =
        [Required, Recommended, FastTrack];

    public string Value { get; }

    private TriageVerdict(string value) => Value = value;

    public static TriageVerdict From(string value)
    {
        TriageVerdict? match = ValidValues.FirstOrDefault(v =>
            string.Equals(v.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El veredicto del tamizaje debe ser uno de: {string.Join(", ", ValidValues.Select(v => v.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
