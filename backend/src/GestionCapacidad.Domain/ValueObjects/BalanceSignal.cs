using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>La señal de balance de un colaborador: una señal, no una sentencia.</summary>
public sealed record BalanceSignal
{
    public static readonly BalanceSignal Usual = new("Usual", "Carga habitual");

    public static readonly BalanceSignal PossibleOverload = new("PossibleOverload", "Posible sobreasignación");

    public static readonly BalanceSignal PossibleUnderload = new("PossibleUnderload", "Posible subasignación");

    public static readonly BalanceSignal NotEvaluable = new("NotEvaluable", "No evaluable");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<BalanceSignal> ValidValues =
        [Usual, PossibleOverload, PossibleUnderload, NotEvaluable];

    public string Value { get; }

    public string Label { get; }

    private BalanceSignal(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static BalanceSignal From(string value)
    {
        BalanceSignal? match = ValidValues.FirstOrDefault(s =>
            string.Equals(s.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"La señal de balance debe ser una de: {string.Join(", ", ValidValues.Select(s => s.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
