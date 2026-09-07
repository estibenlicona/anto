using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// Si la célula del colaborador se desvía como él frente a su propio
/// histórico. Se anota junto a la señal y nunca la atenúa.
/// </summary>
public sealed record SquadContext
{
    public static readonly SquadContext SameDirection = new("SameDirection", "La célula se comporta igual");

    public static readonly SquadContext Different = new("Different", "Distinto de la célula");

    public static readonly SquadContext NoSquad = new("NoSquad", "Sin célula");

    public static readonly IReadOnlyCollection<SquadContext> ValidValues = [SameDirection, Different, NoSquad];

    public string Value { get; }

    public string Label { get; }

    private SquadContext(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static SquadContext From(string value)
    {
        SquadContext? match = ValidValues.FirstOrDefault(s =>
            string.Equals(s.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El contexto de célula debe ser uno de: {string.Join(", ", ValidValues.Select(s => s.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
