using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

public sealed record Criticality
{
    public static readonly Criticality Critical = new("Critical");
    public static readonly Criticality High     = new("High");
    public static readonly Criticality Medium   = new("Medium");
    public static readonly Criticality Low      = new("Low");

    private static readonly IReadOnlyDictionary<string, Criticality> _validValues =
        new Dictionary<string, Criticality>(StringComparer.OrdinalIgnoreCase)
        {
            [Critical.Value] = Critical,
            [High.Value]     = High,
            [Medium.Value]   = Medium,
            [Low.Value]      = Low,
        };

    public static IReadOnlyCollection<string> ValidValues => _validValues.Keys.ToList();

    public string Value { get; }

    private Criticality(string value) => Value = value;

    public static Criticality From(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !_validValues.TryGetValue(value, out var criticality))
        {
            var valid = string.Join(", ", _validValues.Keys);
            throw new DomainException($"'{value}' is not a valid criticality. Valid values are: {valid}.");
        }

        return criticality;
    }

    public override string ToString() => Value;
}
