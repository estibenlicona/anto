using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// En qué punto está la evaluación. Nace <see cref="InProgress"/>; cerrarla
/// congela el perfil y es terminal — corregirla es evaluar de nuevo, no
/// reabrir la que ya cerró.
/// </summary>
public sealed record AssessmentStatus
{
    public static readonly AssessmentStatus InProgress = new("InProgress", "En curso");

    public static readonly AssessmentStatus Closed = new("Closed", "Cerrada");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<AssessmentStatus> ValidValues = [InProgress, Closed];

    /// <summary>Slug del contrato (en inglés, como viaja en la API).</summary>
    public string Value { get; }

    /// <summary>Etiqueta en español, la que se lee en pantalla.</summary>
    public string Label { get; }

    private AssessmentStatus(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static AssessmentStatus From(string value)
    {
        AssessmentStatus? match = ValidValues.FirstOrDefault(s =>
            string.Equals(s.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El estado de la evaluación debe ser uno de: {string.Join(", ", ValidValues.Select(s => s.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
