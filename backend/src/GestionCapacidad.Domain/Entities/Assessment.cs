using System.Text.RegularExpressions;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Primitives;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Domain.Entities;

/// <summary>
/// La evaluación de una persona en un ciclo (<c>YYYY-S1</c> o <c>YYYY-S2</c>).
/// Nace en curso y sin ninguna habilidad calificada — se van agregando una a
/// una a medida que se califican, no todas de una vez al abrir.
///
/// El nombre y el cargo de la persona no viven acá: se resuelven siempre en
/// vivo, incluso para una evaluación cerrada — a diferencia de Prefacturación,
/// acá el mock nunca los congela.
/// </summary>
public sealed partial class Assessment : AggregateRoot
{
    private readonly List<AssessmentSkillAnswer> _skills = [];

    private Assessment()
    {
    }

    public Assessment(Guid personId, string cycle)
    {
        if (personId == Guid.Empty)
        {
            throw new DomainException("La persona de la evaluación es obligatoria");
        }

        if (cycle is null || !CyclePattern().IsMatch(cycle))
        {
            throw new DomainException("El ciclo debe tener la forma YYYY-S1 o YYYY-S2");
        }

        PersonId = personId;
        Cycle = cycle;
        Status = AssessmentStatus.InProgress;
    }

    public Guid PersonId { get; private set; }

    public string Cycle { get; private set; } = string.Empty;

    public AssessmentStatus Status { get; private set; } = AssessmentStatus.InProgress;

    public DateTime? ClosedAtUtc { get; private set; }

    /// <summary>La versión del catálogo vigente al momento de cerrar; nula mientras sigue en curso.</summary>
    public int? CatalogVersionAtClose { get; private set; }

    public IReadOnlyList<AssessmentSkillAnswer> Skills => _skills.AsReadOnly();

    /// <summary>
    /// Califica una habilidad. <paramref name="expectedLevel"/> ya viene
    /// resuelto del catálogo — es la única forma de decidir si hay brecha, y
    /// con brecha la nota es obligatoria: es lo que sostiene la acción del
    /// plan.
    /// </summary>
    public void SaveSkill(
        Guid skillId,
        int level,
        IReadOnlyList<IReadOnlyList<string>> met,
        string note,
        int? expectedLevel)
    {
        if (Status == AssessmentStatus.Closed)
        {
            throw new DomainException("La evaluación está cerrada. Para corregirla hay que evaluar de nuevo.");
        }

        bool hasGap = expectedLevel is int expected && expected > level;
        string trimmedNote = note?.Trim() ?? string.Empty;
        if (hasGap && trimmedNote.Length == 0)
        {
            throw new DomainException("Con brecha la nota es obligatoria: es lo que sostiene la acción del plan.");
        }

        AssessmentSkillAnswer? existing = _skills.FirstOrDefault(s => s.SkillId == skillId);
        if (existing is null)
        {
            existing = new AssessmentSkillAnswer(skillId);
            _skills.Add(existing);
        }

        existing.SetAnswer(level, met, trimmedNote);
        MarkUpdated();
    }

    /// <summary>
    /// Cierra la evaluación: congela el recorte de cada habilidad calificada
    /// con lo que <paramref name="frozenBySkillId"/> trae para ella, y deja de
    /// moverse aunque el catálogo cambie después.
    /// </summary>
    public void Close(
        IReadOnlyDictionary<Guid, (string SkillName, string Group, IReadOnlyList<IReadOnlyList<string>> Levels, int? ExpectedLevel)> frozenBySkillId,
        int catalogVersion,
        DateTime closedAtUtc)
    {
        if (Status == AssessmentStatus.Closed)
        {
            throw new DomainException("La evaluación ya está cerrada");
        }

        foreach (AssessmentSkillAnswer answer in _skills)
        {
            if (frozenBySkillId.TryGetValue(answer.SkillId, out var frozen))
            {
                answer.Freeze(frozen.SkillName, frozen.Group, frozen.Levels, frozen.ExpectedLevel);
            }
        }

        Status = AssessmentStatus.Closed;
        CatalogVersionAtClose = catalogVersion;
        ClosedAtUtc = closedAtUtc;
        MarkUpdated();
    }

    [GeneratedRegex(@"^\d{4}-S[12]$")]
    private static partial Regex CyclePattern();
}
