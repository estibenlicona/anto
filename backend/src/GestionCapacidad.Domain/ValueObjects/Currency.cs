using GestionCapacidad.Domain.Exceptions;

namespace GestionCapacidad.Domain.ValueObjects;

/// <summary>
/// La moneda del documento del proveedor. Por ahora un catálogo cerrado a un
/// único valor: el esperado se calcula en pesos, y comparar contra otra
/// moneda sin una tasa trazada produciría una diferencia que parece válida y
/// no lo es.
/// </summary>
public sealed record Currency
{
    public static readonly Currency Cop = new("COP");

    /// <summary>Los valores del catálogo cerrado, en el orden del contrato.</summary>
    public static readonly IReadOnlyCollection<Currency> ValidValues = [Cop];

    /// <summary>Slug del contrato (en inglés, como viaja en la API).</summary>
    public string Value { get; }

    private Currency(string value)
    {
        Value = value;
    }

    public static Currency From(string value)
    {
        Currency? match = ValidValues.FirstOrDefault(c =>
            string.Equals(c.Value, value, StringComparison.Ordinal));

        return match ?? throw new DomainException(
            $"Por ahora sólo se comparan prefacturas en COP: el esperado está en pesos. Recibido: {value}.");
    }

    public override string ToString() => Value;
}
