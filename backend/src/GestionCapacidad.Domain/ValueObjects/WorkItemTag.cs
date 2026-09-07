using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>Si una historia es de iniciativa o de BAU; nulo cuando no se pudo clasificar.</summary>
public sealed record WorkItemTag
{
    public static readonly WorkItemTag Initiative = new("Initiative", "Iniciativa");

    public static readonly WorkItemTag Bau = new("Bau", "BAU");

    public static readonly IReadOnlyCollection<WorkItemTag> ValidValues = [Initiative, Bau];

    public string Value { get; }

    public string Label { get; }

    private WorkItemTag(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static WorkItemTag From(string value)
    {
        WorkItemTag? match = ValidValues.FirstOrDefault(t =>
            string.Equals(t.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"La marca de la historia debe ser una de: {string.Join(", ", ValidValues.Select(t => t.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
