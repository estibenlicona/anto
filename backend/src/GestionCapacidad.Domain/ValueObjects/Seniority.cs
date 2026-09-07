using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// La escalera de seniority de la persona: Junior, Intermediate o Senior.
/// Es una escala distinta del <see cref="Level"/> (la escala Tuya de 4 con la
/// que se miden habilidades y stacks): describe a la persona, no su nivel
/// técnico, y las dos viajan como campos separados del contrato.
/// </summary>
public sealed record Seniority
{
    public static readonly Seniority Junior = new("Junior", "Junior");

    public static readonly Seniority Intermediate = new("Intermediate", "Intermedio");

    public static readonly Seniority Senior = new("Senior", "Senior");

    /// <summary>Los valores del catálogo cerrado, en orden ascendente.</summary>
    public static readonly IReadOnlyCollection<Seniority> ValidValues =
        [Junior, Intermediate, Senior];

    /// <summary>Slug del contrato (en inglés, como viaja en la API).</summary>
    public string Value { get; }

    /// <summary>Etiqueta en español, la que se lee en pantalla.</summary>
    public string Label { get; }

    private Seniority(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static Seniority From(string value)
    {
        Seniority? match = ValidValues.FirstOrDefault(s =>
            string.Equals(s.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El seniority debe ser uno de: {string.Join(", ", ValidValues.Select(s => s.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
