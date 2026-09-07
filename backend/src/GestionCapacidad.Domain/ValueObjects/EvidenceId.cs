using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>Las seis evidencias de las que se sintetiza la señal de balance.</summary>
public sealed record EvidenceId
{
    public static readonly EvidenceId DemandVsOwnHistory = new("demandVsOwnHistory", "Demanda frente a su histórico");

    public static readonly EvidenceId DemandPerAvailableFte = new("demandPerAvailableFte", "Demanda por FTE disponible");

    public static readonly EvidenceId Completion = new("completion", "Cumplimiento");

    public static readonly EvidenceId CarryOver = new("carryOver", "Carry-over");

    public static readonly EvidenceId UnplannedWork = new("unplannedWork", "Trabajo no planificado");

    public static readonly EvidenceId Multitasking = new("multitasking", "Foco");

    public static readonly IReadOnlyCollection<EvidenceId> ValidValues =
        [DemandVsOwnHistory, DemandPerAvailableFte, Completion, CarryOver, UnplannedWork, Multitasking];

    public string Value { get; }

    public string Label { get; }

    private EvidenceId(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static EvidenceId From(string value)
    {
        EvidenceId? match = ValidValues.FirstOrDefault(e =>
            string.Equals(e.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"La evidencia debe ser una de: {string.Join(", ", ValidValues.Select(e => e.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
