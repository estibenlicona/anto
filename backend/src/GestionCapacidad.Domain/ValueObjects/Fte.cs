using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

public sealed record Fte
{
    public static readonly Fte FullTime = new(1.0f);
    public static readonly Fte HalfTime = new(0.5f);

    public float Value { get; }

    private Fte(float value) => Value = value;

    public static Fte From(float value)
    {
        if (value < 0f || value > 1f)
        {
            throw new DomainException($"FTE must be between 0.0 and 1.0. Got: {value}.");
        }

        return new Fte(value);
    }

    public override string ToString() => Value.ToString("0.##");
}
