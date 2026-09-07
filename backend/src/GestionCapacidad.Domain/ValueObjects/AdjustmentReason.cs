using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>Por qué el período llevó un ajuste sobre el costo mensual.</summary>
public sealed record AdjustmentReason
{
    public static readonly AdjustmentReason Overtime = new("Overtime", "Horas extra");

    public static readonly AdjustmentReason PartialEntry = new("PartialEntry", "Ingreso parcial");

    public static readonly AdjustmentReason Exit = new("Exit", "Salida");

    public static readonly AdjustmentReason Other = new("Other", "Otro");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<AdjustmentReason> ValidValues =
        [Overtime, PartialEntry, Exit, Other];

    /// <summary>Slug del contrato (en inglés, como viaja en la API).</summary>
    public string Value { get; }

    /// <summary>Etiqueta en español, la que se lee en pantalla.</summary>
    public string Label { get; }

    private AdjustmentReason(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static AdjustmentReason From(string value)
    {
        AdjustmentReason? match = ValidValues.FirstOrDefault(r =>
            string.Equals(r.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El motivo del ajuste debe ser uno de: {string.Join(", ", ValidValues.Select(r => r.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
