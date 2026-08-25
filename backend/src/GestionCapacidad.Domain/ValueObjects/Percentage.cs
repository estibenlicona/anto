using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>Percentage value 0–100 for allocation dedication fields.</summary>
public sealed record Percentage
{
    public int Value { get; }

    private Percentage(int value) => Value = value;

    public static Percentage From(int value)
    {
        if (value < 0 || value > 100)
            throw new DomainException($"Percentage must be between 0 and 100. Got: {value}.");

        return new Percentage(value);
    }

    public static Percentage Zero    => new(0);
    public static Percentage Hundred => new(100);

    public override string ToString() => $"{Value}%";
}
