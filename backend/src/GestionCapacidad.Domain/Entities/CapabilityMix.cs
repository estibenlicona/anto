using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// El mix de capacidades por talla: qué composición de equipo pide una
/// iniciativa según su tamaño. Agregado de fila única que se reemplaza en
/// bloque; la lista puede quedar vacía (un chapter que todavía no lo definió).
/// </summary>
public sealed class CapabilityMix : AggregateRoot
{
    private readonly List<CapabilityMixRow> _rows = [];

    private CapabilityMix()
    {
    }

    public CapabilityMix(IReadOnlyList<CapabilityMixRow> rows)
    {
        Set(rows);
    }

    /// <summary>Las capacidades, en el orden en que se guardaron.</summary>
    public IReadOnlyCollection<CapabilityMixRow> Rows => _rows.AsReadOnly();

    public void Replace(IReadOnlyList<CapabilityMixRow> rows)
    {
        Set(rows);
        MarkUpdated();
    }

    private void Set(IReadOnlyList<CapabilityMixRow> rows)
    {
        ArgumentNullException.ThrowIfNull(rows);

        var keys = new HashSet<string>(StringComparer.Ordinal);
        // El nombre se compara sin distinguir mayúsculas: dos filas llamadas
        // "QA Engineer" y "qa engineer" son la misma capacidad escrita de dos
        // formas, y la pantalla no podría distinguirlas.
        var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (CapabilityMixRow row in rows)
        {
            if (!keys.Add(row.Key))
            {
                throw new DomainException($"El id de la capacidad se repite: {row.Key}.");
            }

            if (!names.Add(row.Capacidad))
            {
                throw new DomainException($"El nombre de la capacidad se repite: {row.Capacidad}.");
            }
        }

        _rows.Clear();
        _rows.AddRange(rows.OrderBy(r => r.Position));
    }
}
