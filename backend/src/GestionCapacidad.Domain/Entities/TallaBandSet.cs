using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Las bandas de talla vigentes: cinco bandas que reparten 0–100 % y los
/// cuatro cortes que las separan. Agregado de fila única que se reemplaza en
/// bloque.
///
/// Se guarda un número por frontera y no un mínimo y un máximo por banda
/// porque con dos números por banda cada capa tendría la oportunidad de dejar
/// un hueco o un solape; con la frontera compartida no hay dos números que
/// puedan discrepar. Los cortes son los interiores: 0 y 100 cierran el rango
/// y no se guardan porque no se mueven.
/// </summary>
public sealed class TallaBandSet : AggregateRoot
{
    public const int BoundaryCount = 4;
    public const int BandCount = 5;
    public const decimal RangeMin = 0m;
    public const decimal RangeMax = 100m;

    /// <summary>Ninguna banda puede quedar más angosta que esto, en puntos de porcentaje.</summary>
    public const decimal MinBandWidth = 5m;

    private readonly List<TallaBand> _bands = [];

    private TallaBandSet()
    {
    }

    public TallaBandSet(IReadOnlyList<decimal> boundaries, IReadOnlyList<TallaBand> bands)
    {
        Set(boundaries, bands);
    }

    /// <summary>Los cuatro cortes interiores de porcentaje, en orden creciente.</summary>
    public IReadOnlyList<decimal> Boundaries { get; private set; } = [];

    /// <summary>Las cinco bandas, en el orden en que se guardaron.</summary>
    public IReadOnlyCollection<TallaBand> Bands => _bands.AsReadOnly();

    public void Replace(IReadOnlyList<decimal> boundaries, IReadOnlyList<TallaBand> bands)
    {
        Set(boundaries, bands);
        MarkUpdated();
    }

    private void Set(IReadOnlyList<decimal> boundaries, IReadOnlyList<TallaBand> bands)
    {
        ArgumentNullException.ThrowIfNull(boundaries);
        ArgumentNullException.ThrowIfNull(bands);

        if (boundaries.Count != BoundaryCount)
        {
            throw new DomainException($"Deben enviarse exactamente {BoundaryCount} cortes de porcentaje.");
        }

        if (bands.Count != BandCount)
        {
            throw new DomainException($"Deben enviarse exactamente {BandCount} bandas de talla.");
        }

        // Los cortes reparten el rango: crecientes, y ninguna banda —tampoco
        // la primera ni la última, que cierran contra 0 y 100— por debajo del
        // ancho mínimo.
        decimal previous = RangeMin;
        for (int i = 0; i < boundaries.Count; i++)
        {
            decimal boundary = boundaries[i];
            decimal next = i == boundaries.Count - 1 ? RangeMax : boundaries[i + 1];

            if (boundary - previous < MinBandWidth || next - boundary < MinBandWidth)
            {
                throw new DomainException(
                    $"Los cortes deben ser crecientes y dejar al menos {MinBandWidth:0.##} puntos entre bandas " +
                    $"y contra {RangeMin:0.##} y {RangeMax:0.##}.");
            }

            previous = boundary;
        }

        var tallas = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (TallaBand band in bands)
        {
            if (!tallas.Add(band.Talla))
            {
                throw new DomainException($"La talla se repite: {band.Talla}.");
            }
        }

        Boundaries = [.. boundaries];
        _bands.Clear();
        _bands.AddRange(bands.OrderBy(b => b.Position));
    }
}
