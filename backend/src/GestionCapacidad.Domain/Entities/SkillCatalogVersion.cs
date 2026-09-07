using GestionCapacidad.Domain.Primitives;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// El contador de versión del catálogo de habilidades. Agregado de fila
/// única: sube en uno con cada mutación (alta, edición, activar/desactivar,
/// criterios, expectativas), para que un cliente detecte que el catálogo
/// cambió. No guarda historial de versiones publicadas — eso lo resolverá
/// Evaluaciones con su propio snapshot al cerrar una evaluación.
/// </summary>
public sealed class SkillCatalogVersion : AggregateRoot
{
    public SkillCatalogVersion()
    {
        Value = 1;
    }

    public int Value { get; private set; }

    public void Increment()
    {
        Value += 1;
        MarkUpdated();
    }
}
