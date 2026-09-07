using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>El estado de una línea de expertise. Archivada conserva su historia y se puede reactivar.</summary>
public sealed record ExpertiseLineStatus
{
    public static readonly ExpertiseLineStatus Active = new("Active", "Activa");

    public static readonly ExpertiseLineStatus Archived = new("Archived", "Archivada");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<ExpertiseLineStatus> ValidValues = [Active, Archived];

    public string Value { get; }

    public string Label { get; }

    private ExpertiseLineStatus(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static ExpertiseLineStatus From(string value)
    {
        ExpertiseLineStatus? match = ValidValues.FirstOrDefault(s =>
            string.Equals(s.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El estado de la línea debe ser uno de: {string.Join(", ", ValidValues.Select(s => s.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
