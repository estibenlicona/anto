using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.Skills;

/// <summary>
/// Los cargos vigentes del chapter: los distintos <c>Position</c> de las
/// personas registradas, no un catálogo propio — inventar uno duplicaría un
/// dato que ya existe y se desincronizaría con la primera alta de persona.
/// </summary>
public static class SkillCatalogPositions
{
    public static async Task<IReadOnlyList<string>> GetCurrentAsync(
        IPersonRepository people,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Person> all = await people.GetAllAsync(cancellationToken);

        return
        [
            .. all
                .Select(p => p.Position)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(p => p, StringComparer.OrdinalIgnoreCase),
        ];
    }
}
