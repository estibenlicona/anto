using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>El estado de una acción del plan de carrera. Cumplida no cierra la brecha — eso es reevaluar.</summary>
public sealed record PlanActionStatus
{
    public static readonly PlanActionStatus InProgress = new("InProgress", "En curso");

    public static readonly PlanActionStatus Done = new("Done", "Cumplida");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<PlanActionStatus> ValidValues = [InProgress, Done];

    public string Value { get; }

    public string Label { get; }

    private PlanActionStatus(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static PlanActionStatus From(string value)
    {
        PlanActionStatus? match = ValidValues.FirstOrDefault(s =>
            string.Equals(s.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El estado de la acción debe ser uno de: {string.Join(", ", ValidValues.Select(s => s.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
