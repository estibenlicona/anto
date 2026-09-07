using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>Hacia dónde apunta una evidencia de balance.</summary>
public sealed record EvidenceDirection
{
    public static readonly EvidenceDirection Over = new("Over", "Sobre");

    public static readonly EvidenceDirection Under = new("Under", "Sub");

    public static readonly EvidenceDirection Neutral = new("Neutral", "Neutra");

    public static readonly EvidenceDirection Unknown = new("Unknown", "No se pudo evaluar");

    public static readonly IReadOnlyCollection<EvidenceDirection> ValidValues = [Over, Under, Neutral, Unknown];

    public string Value { get; }

    public string Label { get; }

    private EvidenceDirection(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static EvidenceDirection From(string value)
    {
        EvidenceDirection? match = ValidValues.FirstOrDefault(d =>
            string.Equals(d.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"La dirección de la evidencia debe ser una de: {string.Join(", ", ValidValues.Select(d => d.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
