using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// A qué fase de la estimación sirve un modelo. Las tres fases estiman lo mismo
/// con distinta información: la primera con el enunciado de la iniciativa, la
/// segunda con el alcance refinado, la tercera con lo que efectivamente pasó.
/// Cada una tiene su propio modelo porque las preguntas que se pueden responder
/// en cada momento son distintas.
/// </summary>
public sealed record EstimationPhase
{
    /// <summary>Estimación inicial, sobre el enunciado.</summary>
    public static readonly EstimationPhase Inicial = new(1, "Inicial");

    /// <summary>Estimación refinada, con el alcance detallado.</summary>
    public static readonly EstimationPhase Refinada = new(2, "Refinada");

    /// <summary>Cierre, contra lo ejecutado.</summary>
    public static readonly EstimationPhase Cierre = new(3, "Cierre");

    public static readonly IReadOnlyCollection<EstimationPhase> ValidValues =
        [Inicial, Refinada, Cierre];

    public int Number { get; }

    public string Value { get; }

    private EstimationPhase(int number, string value)
    {
        Number = number;
        Value = value;
    }

    public static EstimationPhase From(string value)
    {
        EstimationPhase? match = ValidValues.FirstOrDefault(v =>
            string.Equals(v.Value, value, StringComparison.OrdinalIgnoreCase));

        return match ?? throw new DomainException(
            $"La fase de un modelo debe ser una de: {string.Join(", ", ValidValues.Select(v => v.Value))}. Recibido: {value}.");
    }

    public static EstimationPhase FromNumber(int number)
    {
        EstimationPhase? match = ValidValues.FirstOrDefault(v => v.Number == number);

        return match ?? throw new DomainException(
            $"La fase de un modelo debe ser 1, 2 o 3. Recibido: {number}.");
    }

    public override string ToString() => Value;
}
