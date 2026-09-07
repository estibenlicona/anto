using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>A qué familia pertenece la habilidad del catálogo.</summary>
public sealed record SkillGroup
{
    public static readonly SkillGroup Human = new("human", "Humana");

    public static readonly SkillGroup Technical = new("technical", "Técnica");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<SkillGroup> ValidValues = [Human, Technical];

    /// <summary>Slug del contrato (en inglés, como viaja en la API).</summary>
    public string Value { get; }

    /// <summary>Etiqueta en español, la que se lee en pantalla.</summary>
    public string Label { get; }

    private SkillGroup(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static SkillGroup From(string value)
    {
        SkillGroup? match = ValidValues.FirstOrDefault(g =>
            string.Equals(g.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El grupo debe ser uno de: {string.Join(", ", ValidValues.Select(g => g.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
