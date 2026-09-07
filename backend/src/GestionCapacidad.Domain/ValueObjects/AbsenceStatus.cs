using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// En qué punto está la ausencia. Nace <see cref="Requested"/>; sólo lo
/// <see cref="Approved"/> descuenta capacidad; <see cref="Rejected"/> es
/// terminal — una aprobación equivocada se revierte rechazándola, y el
/// registro conserva que hubo una aprobación en vez de fingir que no ocurrió.
/// </summary>
public sealed record AbsenceStatus
{
    public static readonly AbsenceStatus Requested = new("Requested", "Solicitada");

    public static readonly AbsenceStatus Approved = new("Approved", "Aprobada");

    public static readonly AbsenceStatus Rejected = new("Rejected", "Rechazada");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<AbsenceStatus> ValidValues =
        [Requested, Approved, Rejected];

    /// <summary>Slug del contrato (en inglés, como viaja en la API).</summary>
    public string Value { get; }

    /// <summary>Etiqueta en español, la que se lee en pantalla.</summary>
    public string Label { get; }

    private AbsenceStatus(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static AbsenceStatus From(string value)
    {
        AbsenceStatus? match = ValidValues.FirstOrDefault(s =>
            string.Equals(s.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El estado de la ausencia debe ser uno de: {string.Join(", ", ValidValues.Select(s => s.Value))}. Recibido: {value}.");
    }

    /// <summary>Sólo lo aprobado descuenta capacidad.</summary>
    public bool IsApproved => this == Approved;

    public override string ToString() => Value;
}
