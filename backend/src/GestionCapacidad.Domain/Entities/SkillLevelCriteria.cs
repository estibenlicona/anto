using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Los criterios de un nivel de una habilidad: lista ordenada, de largo
/// libre — el sistema no impone ni asume una cantidad, y un nivel puede tener
/// más o menos criterios que otro de la misma habilidad.
/// </summary>
public sealed class SkillLevelCriteria
{
    private readonly List<string> _criteria = [];

    private SkillLevelCriteria()
    {
    }

    public SkillLevelCriteria(int level, IReadOnlyList<string> criteria)
    {
        Level = ValueObjects.Level.From(level);
        Set(criteria);
    }

    public Level Level { get; private set; } = ValueObjects.Level.Principiante;

    /// <summary>Los criterios de este nivel, en el orden en que se guardaron.</summary>
    public IReadOnlyList<string> Criteria => _criteria.AsReadOnly();

    /// <summary>Reemplaza la lista entera: los criterios se editan en bloque, y el orden es parte del dato.</summary>
    public void Replace(IReadOnlyList<string> criteria) => Set(criteria);

    private void Set(IReadOnlyList<string> criteria)
    {
        ArgumentNullException.ThrowIfNull(criteria);

        var trimmed = new List<string>(criteria.Count);
        foreach (string criterion in criteria)
        {
            string value = criterion?.Trim() ?? string.Empty;
            if (value.Length == 0)
            {
                throw new DomainException("Un criterio no puede quedar vacío");
            }

            trimmed.Add(value);
        }

        _criteria.Clear();
        _criteria.AddRange(trimmed);
    }
}
