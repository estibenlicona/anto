using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

public sealed record InitiativeStatus
{
    public static readonly InitiativeStatus Evaluation = new("Evaluation");
    public static readonly InitiativeStatus Active     = new("Active");
    public static readonly InitiativeStatus Closed     = new("Closed");

    private static readonly IReadOnlyDictionary<string, InitiativeStatus> _validValues =
        new Dictionary<string, InitiativeStatus>(StringComparer.OrdinalIgnoreCase)
        {
            [Evaluation.Value] = Evaluation,
            [Active.Value]     = Active,
            [Closed.Value]     = Closed,
        };

    public string Value { get; }

    private InitiativeStatus(string value) => Value = value;

    public static InitiativeStatus From(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !_validValues.TryGetValue(value, out var status))
        {
            var valid = string.Join(", ", _validValues.Keys);
            throw new DomainException($"'{value}' is not a valid initiative status. Valid values are: {valid}.");
        }

        return status;
    }

    public static IReadOnlyCollection<string> ValidValues => _validValues.Keys.ToList();

    public bool IsActive => this == Active;

    public override string ToString() => Value;
}
