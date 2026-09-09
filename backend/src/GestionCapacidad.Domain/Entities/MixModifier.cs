using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Un ajuste del mix base disparado por el puntaje de un driver.
///
/// Existe porque el mix base es por talla, y dos iniciativas de la misma talla
/// no siempre piden la misma composición: una con mucha integración necesita más
/// backend, una con mucho front necesita menos. El modificador expresa eso sin
/// multiplicar las columnas del mix por cada combinación posible.
///
/// **Reparte y no agrega**: sus ajustes suman cero puntos porcentuales, de modo
/// que el mix siga sumando 100 después de aplicarlo. Un modificador que sumara
/// sin restar inventaría capacidad que la iniciativa no pidió.
/// </summary>
public sealed class MixModifier
{
    private readonly List<MixAdjustment> _adjustments = [];
    private readonly List<string> _tallas = [];

    private MixModifier()
    {
    }

    public MixModifier(
        int position,
        string code,
        string driverCode,
        MixConditionOperator conditionOperator,
        decimal threshold,
        IReadOnlyList<string> tallas,
        IReadOnlyList<MixAdjustment> adjustments)
    {
        ArgumentNullException.ThrowIfNull(tallas);
        ArgumentNullException.ThrowIfNull(adjustments);

        if (position < 0)
        {
            throw new DomainException("La posición del modificador no puede ser negativa.");
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new DomainException("El código del modificador es obligatorio.");
        }

        if (code.Trim().Length > 50)
        {
            throw new DomainException("El código del modificador no puede superar 50 caracteres.");
        }

        string id = code.Trim();

        if (string.IsNullOrWhiteSpace(driverCode))
        {
            throw new DomainException($"El modificador {id} tiene que apuntar a un driver.");
        }

        if (threshold is < 0m or > 1m)
        {
            throw new DomainException(
                $"El umbral del modificador {id} debe estar entre 0 y 1. Recibido: {threshold}.");
        }

        if (tallas.Count == 0)
        {
            throw new DomainException($"El modificador {id} tiene que aplicar a al menos una talla.");
        }

        if (adjustments.Count < 2)
        {
            throw new DomainException(
                $"El modificador {id} necesita al menos dos ajustes: de dónde sale el porcentaje y a dónde va.");
        }

        if (adjustments.Select(a => a.CapabilityKey).Distinct(StringComparer.Ordinal).Count() != adjustments.Count)
        {
            throw new DomainException($"El modificador {id} ajusta dos veces la misma capacidad.");
        }

        decimal total = adjustments.Sum(a => a.Points);
        if (total != 0m)
        {
            throw new DomainException(
                $"El modificador {id} no reparte: sus ajustes suman {total} puntos en vez de cero.");
        }

        Position = position;
        Code = id;
        DriverCode = driverCode.Trim();
        ConditionOperator = conditionOperator;
        Threshold = threshold;
        _tallas.AddRange(tallas);
        _adjustments.AddRange(adjustments.OrderBy(a => a.Position));
    }

    public int Position { get; private set; }

    public string Code { get; private set; } = string.Empty;

    public string DriverCode { get; private set; } = string.Empty;

    public MixConditionOperator ConditionOperator { get; private set; }

    /// <summary>El puntaje del driver a partir del cual —o hasta el cual— se dispara.</summary>
    public decimal Threshold { get; private set; }

    /// <summary>Las tallas a las que aplica.</summary>
    public IReadOnlyList<string> Tallas => _tallas.AsReadOnly();

    public IReadOnlyList<MixAdjustment> Adjustments => _adjustments.AsReadOnly();

    /// <summary>Si el modificador aplica a esa talla con ese puntaje de driver.</summary>
    public bool Triggers(string talla, decimal driverScore) =>
        _tallas.Contains(talla, StringComparer.Ordinal)
        && (ConditionOperator is MixConditionOperator.Gte
            ? driverScore >= Threshold
            : driverScore <= Threshold);
}
