using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>Cómo se lee el costo mensual de una persona contra la banda de su nivel. Nunca se persiste — es puramente derivada.</summary>
public sealed record CostReading
{
    public static readonly CostReading InRange = new("InRange", "En rango");

    public static readonly CostReading High = new("High", "Alto");

    public static readonly CostReading Low = new("Low", "Bajo");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<CostReading> ValidValues = [InRange, High, Low];

    public string Value { get; }

    public string Label { get; }

    private CostReading(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static CostReading From(string value)
    {
        CostReading? match = ValidValues.FirstOrDefault(r =>
            string.Equals(r.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"La lectura de costo debe ser una de: {string.Join(", ", ValidValues.Select(r => r.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
