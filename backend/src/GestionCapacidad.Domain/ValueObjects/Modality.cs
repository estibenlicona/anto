using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

public sealed record Modality
{
    public static readonly Modality Remote = new("Remote");
    public static readonly Modality Hybrid = new("Hybrid");
    public static readonly Modality OnSite = new("OnSite");

    private static readonly IReadOnlyDictionary<string, Modality> _validValues =
        new Dictionary<string, Modality>(StringComparer.OrdinalIgnoreCase)
        {
            [Remote.Value] = Remote,
            [Hybrid.Value] = Hybrid,
            [OnSite.Value] = OnSite,
        };

    public string Value { get; }

    private Modality(string value) => Value = value;

    public static Modality From(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !_validValues.TryGetValue(value, out var modality))
        {
            var valid = string.Join(", ", _validValues.Keys);
            throw new DomainException($"'{value}' is not a valid modality. Valid values are: {valid}.");
        }

        return modality;
    }

    public static IReadOnlyCollection<string> ValidValues => _validValues.Keys.ToList();

    public override string ToString() => Value;
}
