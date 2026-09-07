using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>Por qué un colaborador no se pudo evaluar.</summary>
public sealed record NotEvaluableReason
{
    public static readonly NotEvaluableReason NoIdentity = new("NoIdentity", "Sin identidad DevOps");

    public static readonly NotEvaluableReason NoSprint = new("NoSprint", "Sin sprint en Azure DevOps");

    public static readonly NotEvaluableReason MissingSnapshot = new("MissingSnapshot", "Sprint sin snapshot");

    public static readonly NotEvaluableReason InsufficientHistory = new("InsufficientHistory", "Histórico insuficiente");

    public static readonly IReadOnlyCollection<NotEvaluableReason> ValidValues =
        [NoIdentity, NoSprint, MissingSnapshot, InsufficientHistory];

    public string Value { get; }

    public string Label { get; }

    private NotEvaluableReason(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public static NotEvaluableReason From(string value)
    {
        NotEvaluableReason? match = ValidValues.FirstOrDefault(r =>
            string.Equals(r.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"El motivo de no evaluable debe ser uno de: {string.Join(", ", ValidValues.Select(r => r.Value))}. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
