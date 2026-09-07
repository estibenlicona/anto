using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// Por qué se ausenta la persona. Los tres tipos descuentan capacidad igual;
/// se distinguen porque la conversación con el proveedor y con la persona no
/// es la misma, y porque sólo el permiso admite media jornada.
/// </summary>
public sealed record AbsenceType
{
    public static readonly AbsenceType Vacation = new("Vacation", "Vacaciones");

    public static readonly AbsenceType Leave = new("Leave", "Permiso");

    public static readonly AbsenceType SickLeave = new("SickLeave", "Incapacidad");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<AbsenceType> ValidValues =
        [Vacation, Leave, SickLeave];

    /// <summary>Slug del contrato (en inglés, como viaja en la API).</summary>
    public string Value { get; }

    /// <summary>Etiqueta en español, la que se lee en pantalla.</summary>
    public string Label { get; }

    private AbsenceType(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static AbsenceType From(string value)
    {
        AbsenceType? match = ValidValues.FirstOrDefault(t =>
            string.Equals(t.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El tipo de ausencia debe ser uno de: {string.Join(", ", ValidValues.Select(t => t.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
