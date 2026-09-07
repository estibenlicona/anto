using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una habilidad del catálogo: su nombre, su grupo, y los cuatro niveles de
/// la escala Tuya con sus criterios. Nace activa, con los cuatro niveles
/// presentes y vacíos — la escala existe desde el principio, los criterios se
/// cargan después.
///
/// Que el nombre no choque con otra habilidad del catálogo exige mirar el
/// conjunto completo, así que esa guarda no vive acá: la hace cumplir el use
/// case, igual que el solape de <see cref="Absence"/>.
/// </summary>
public sealed class Skill : AggregateRoot
{
    private readonly List<SkillLevelCriteria> _levels = [];
    private readonly List<SkillExpectation> _expectations = [];

    private Skill()
    {
    }

    public Skill(string name, SkillGroup group, string description)
    {
        ArgumentNullException.ThrowIfNull(group);

        SetDetails(name, group, description);
        Active = true;

        // Los cuatro niveles de la escala Tuya, siempre presentes: no se
        // agregan ni se quitan, sólo se reemplazan sus criterios.
        for (int level = ValueObjects.Level.Min; level <= ValueObjects.Level.Max; level++)
        {
            _levels.Add(new SkillLevelCriteria(level, []));
        }
    }

    public string Name { get; private set; } = string.Empty;

    public SkillGroup Group { get; private set; } = SkillGroup.Technical;

    public string Description { get; private set; } = string.Empty;

    /// <summary>Desactivada sigue visible en las evaluaciones anteriores, pero no se ofrece en las nuevas.</summary>
    public bool Active { get; private set; }

    /// <summary>Los cuatro niveles, en orden 1 a 4.</summary>
    public IReadOnlyList<SkillLevelCriteria> Levels => _levels.AsReadOnly();

    /// <summary>Sólo los cargos con nivel declarado; el resto se resuelve "sin definir" al responder.</summary>
    public IReadOnlyList<SkillExpectation> Expectations => _expectations.AsReadOnly();

    public void UpdateDetails(string name, SkillGroup group, string description)
    {
        ArgumentNullException.ThrowIfNull(group);

        SetDetails(name, group, description);
        MarkUpdated();
    }

    public void SetActive(bool active)
    {
        Active = active;
        MarkUpdated();
    }

    /// <summary>Reemplaza en bloque los criterios de un nivel de la escala Tuya (1 a 4).</summary>
    public void ReplaceCriteria(int level, IReadOnlyList<string> criteria)
    {
        SkillLevelCriteria? target = _levels.FirstOrDefault(l => l.Level.Value == level);
        if (target is null)
        {
            throw new DomainException(
                $"El nivel debe estar entre {ValueObjects.Level.Min} y {ValueObjects.Level.Max}. Recibido: {level}.");
        }

        target.Replace(criteria);
        MarkUpdated();
    }

    /// <summary>Declara el nivel que un cargo exige; con <paramref name="level"/> nulo, retira la exigencia.</summary>
    public void SetExpectation(string position, int? level)
    {
        if (string.IsNullOrWhiteSpace(position))
        {
            throw new DomainException("El cargo es obligatorio");
        }

        string trimmedPosition = position.Trim();
        _expectations.RemoveAll(e => string.Equals(e.Position, trimmedPosition, StringComparison.Ordinal));

        if (level is int value)
        {
            _expectations.Add(new SkillExpectation(trimmedPosition, value));
        }

        MarkUpdated();
    }

    private void SetDetails(string name, SkillGroup group, string description)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("El nombre de la habilidad es obligatorio");
        }

        if (name.Trim().Length > 200)
        {
            throw new DomainException("El nombre de la habilidad no puede superar 200 caracteres.");
        }

        Name = name.Trim();
        Group = group;
        Description = description?.Trim() ?? string.Empty;
    }
}
