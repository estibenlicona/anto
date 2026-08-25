using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

public sealed record InitiativeType
{
    public static readonly InitiativeType Transformation = new("Transformation");
    public static readonly InitiativeType BAU            = new("BAU");
    public static readonly InitiativeType Mixed          = new("Mixed");

    private static readonly IReadOnlyDictionary<string, InitiativeType> _validValues =
        new Dictionary<string, InitiativeType>(StringComparer.OrdinalIgnoreCase)
        {
            [Transformation.Value] = Transformation,
            [BAU.Value]            = BAU,
            [Mixed.Value]          = Mixed,
        };

    public string Value { get; }

    private InitiativeType(string value) => Value = value;

    public static InitiativeType From(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !_validValues.TryGetValue(value, out var type))
        {
            var valid = string.Join(", ", _validValues.Keys);
            throw new DomainException($"'{value}' is not a valid initiative type. Valid values are: {valid}.");
        }

        return type;
    }

    public static IReadOnlyCollection<string> ValidValues => _validValues.Keys.ToList();

    public override string ToString() => Value;
}
