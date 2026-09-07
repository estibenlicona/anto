using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// La procedencia de las métricas de un snapshot. Sólo <see cref="Sealed"/>
/// alimenta el histórico y la tendencia; un sprint sin snapshot sellado no
/// dice lo que ocurrió, porque los equipos ya limpiaron las HUs.
/// </summary>
public sealed record SnapshotStatus
{
    public static readonly SnapshotStatus Sealed = new("Sealed", "Sellado");

    public static readonly SnapshotStatus Provisional = new("Provisional", "Provisional");

    public static readonly SnapshotStatus Missing = new("Missing", "Sin snapshot");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<SnapshotStatus> ValidValues = [Sealed, Provisional, Missing];

    /// <summary>Slug del contrato (en inglés, como viaja en la API).</summary>
    public string Value { get; }

    /// <summary>Etiqueta en español, la que se lee en pantalla.</summary>
    public string Label { get; }

    private SnapshotStatus(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static SnapshotStatus From(string value)
    {
        SnapshotStatus? match = ValidValues.FirstOrDefault(s =>
            string.Equals(s.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El estado del snapshot debe ser uno de: {string.Join(", ", ValidValues.Select(s => s.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
