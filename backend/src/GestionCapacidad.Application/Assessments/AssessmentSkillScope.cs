using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Assessments;

/// <summary>
/// Las habilidades que una evaluación puede recorrer: las activas del
/// catálogo, más cualquiera que esta evaluación ya haya usado — una que se
/// desactivó después no puede desaparecer de lo que ya se calificó con ella.
/// </summary>
public static class AssessmentSkillScope
{
    public static IReadOnlyList<Skill> Resolve(Assessment assessment, IReadOnlyList<Skill> allSkills)
    {
        var used = new HashSet<Guid>(assessment.Skills.Select(s => s.SkillId));
        return [.. allSkills.Where(s => s.Active || used.Contains(s.Id))];
    }
}
