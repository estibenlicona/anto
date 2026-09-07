using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Skills;

/// <summary>
/// Arma el DTO de una habilidad cruzando lo guardado contra los cargos
/// vigentes: <c>expectations</c> trae una entrada por cada cargo, con nivel o
/// <c>null</c> ("sin definir"), no sólo los que ya tienen algo declarado.
/// </summary>
public static class SkillCatalogMappings
{
    public static SkillDto ToDto(Skill skill, IReadOnlyList<string> positions)
    {
        Dictionary<string, int> levelByPosition = skill.Expectations
            .ToDictionary(e => e.Position, e => e.Level.Value, StringComparer.Ordinal);

        return new SkillDto(
            skill.Id,
            skill.Name,
            skill.Group.Value,
            skill.Description,
            skill.Active,
            [.. skill.Levels.OrderBy(l => l.Level.Value).Select(l => new SkillLevelDto(l.Level.Value, l.Criteria))],
            [.. positions.Select(p => new PositionExpectationDto(
                p, levelByPosition.TryGetValue(p, out int level) ? level : null))]);
    }

    public static SkillsCatalogDto ToDto(int version, IReadOnlyList<string> positions, IReadOnlyList<Skill> skills) =>
        new(version, positions, [.. skills.Select(s => ToDto(s, positions))]);
}
