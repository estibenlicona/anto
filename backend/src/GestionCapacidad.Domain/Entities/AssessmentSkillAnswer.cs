using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// Una habilidad calificada dentro de una evaluación, en dos momentos: la
/// respuesta (nivel alcanzado, criterios marcados, nota), mutable mientras la
/// evaluación está en curso; y el recorte congelado (nombre, grupo, criterios
/// de los cuatro niveles, nivel exigido), fijado una sola vez al cerrar. Los
/// dos bloques conviven en la misma fila porque describen la misma habilidad
/// calificada en dos momentos de su vida, no dos conceptos distintos.
/// </summary>
public sealed class AssessmentSkillAnswer
{
    private static readonly IReadOnlyList<IReadOnlyList<string>> EmptyMet =
        [Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>(), Array.Empty<string>()];

    private AssessmentSkillAnswer()
    {
    }

    public AssessmentSkillAnswer(Guid skillId)
    {
        SkillId = skillId;
        Met = EmptyMet;
    }

    public Guid SkillId { get; private set; }

    /// <summary>Nulo hasta que se califica.</summary>
    public int? Level { get; private set; }

    /// <summary>Textos marcados por nivel; índice 0..3 = niveles 1..4.</summary>
    public IReadOnlyList<IReadOnlyList<string>> Met { get; private set; } = EmptyMet;

    public string Note { get; private set; } = string.Empty;

    /// <summary>El nombre de la habilidad al momento de cerrar; nulo mientras la evaluación sigue en curso.</summary>
    public string? FrozenSkillName { get; private set; }

    public string? FrozenGroup { get; private set; }

    /// <summary>Los criterios completos de los cuatro niveles, tal como estaban al cerrar.</summary>
    public IReadOnlyList<IReadOnlyList<string>>? FrozenLevels { get; private set; }

    public int? FrozenExpectedLevel { get; private set; }

    public void SetAnswer(int level, IReadOnlyList<IReadOnlyList<string>> met, string note)
    {
        Level = ValueObjects.Level.From(level).Value;
        Met = NormalizeFour(met);
        Note = note?.Trim() ?? string.Empty;
    }

    public void Freeze(string skillName, string group, IReadOnlyList<IReadOnlyList<string>> levelsCriteria, int? expectedLevel)
    {
        FrozenSkillName = skillName;
        FrozenGroup = group;
        FrozenLevels = NormalizeFour(levelsCriteria);
        FrozenExpectedLevel = expectedLevel;
    }

    /// <summary>
    /// Copia cada lista en vez de quedarse con la referencia: lo que se
    /// congela no puede seguir cambiando si quien llamó pasó una vista viva
    /// sobre una colección mutable (como <c>SkillLevelCriteria.Criteria</c>).
    /// </summary>
    private static IReadOnlyList<IReadOnlyList<string>> NormalizeFour(IReadOnlyList<IReadOnlyList<string>>? lists)
    {
        var result = new List<IReadOnlyList<string>>(4);
        for (int i = 0; i < 4; i++)
        {
            result.Add(lists is not null && i < lists.Count && lists[i] is not null ? [.. lists[i]] : []);
        }

        return result;
    }
}
