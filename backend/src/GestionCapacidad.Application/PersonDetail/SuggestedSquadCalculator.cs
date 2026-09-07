using GestionCapacidad.Application.Common;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.PersonDetail;

/// <summary>
/// Células sugeridas para una persona sin célula: puerto literal del mock.
/// Las dos tablas están indexadas por *nombre* de célula, no por id — los
/// ids del mock son ficticios; los nombres son los que ya existen en las
/// semillas.
/// </summary>
public static class SuggestedSquadCalculator
{
    private const int DefaultRequiredLevel = 2;

    private static readonly IReadOnlyDictionary<string, string[]> WantedPositionsBySquad = new Dictionary<string, string[]>
    {
        ["Pagos Instantáneos"] = ["Product Owner", "Backend Dev"],
        ["Fraude Tarjetas"] = ["Product Owner", "Backend Dev"],
        ["Canales Digitales"] = ["QA Engineer"],
        ["Plataforma de Datos"] = ["Data Analyst"],
    };

    private static readonly IReadOnlyDictionary<string, IReadOnlyDictionary<string, int>> RequiredLevelBySquadAndPosition =
        new Dictionary<string, IReadOnlyDictionary<string, int>>
        {
            ["Backend Platform"] = new Dictionary<string, int> { ["Backend Dev"] = 3, ["Arquitecto"] = 4, ["Frontend Dev"] = 2 },
            ["Canales Digitales"] = new Dictionary<string, int> { ["QA Engineer"] = 3, ["Backend Dev"] = 3 },
            ["Fraude Tarjetas"] = new Dictionary<string, int> { ["UX Designer"] = 3, ["Product Owner"] = 4, ["Backend Dev"] = 4 },
            ["Pagos Instantáneos"] = new Dictionary<string, int> { ["Product Owner"] = 3, ["Backend Dev"] = 3 },
            ["Plataforma de Datos"] = new Dictionary<string, int> { ["Data Engineer"] = 3, ["Data Analyst"] = 2 },
        };

    public static IReadOnlyList<SuggestedSquadDto> Compute(
        Person person,
        IReadOnlyList<Squad> squads,
        IReadOnlyList<Allocation> allocations,
        IReadOnlyDictionary<Guid, Person> peopleById)
    {
        List<SuggestedSquadDto> suggestions = [];
        foreach (Squad squad in squads)
        {
            if (!WantedPositionsBySquad.TryGetValue(squad.Name, out string[]? wanted) ||
                !wanted.Contains(person.Position))
            {
                continue;
            }

            List<Allocation> team = [.. allocations.Where(a => a.SquadId == squad.Id)];
            bool alreadyCovered = team.Any(a =>
                string.Equals(peopleById.GetValueOrDefault(a.PersonId)?.Position, person.Position, StringComparison.Ordinal));
            if (alreadyCovered)
            {
                continue;
            }

            int requiredLevel = RequiredLevelFor(squad.Name, person.Position);

            double allocatedFte = FteMath.FteOfPercentages(team.Select(a => a.DedicationPercentage.Value));
            double teamAvailableFte = FteMath.AvailableFteOf(
                team.Select(a => peopleById.GetValueOrDefault(a.PersonId)?.AvailableFte.Value ?? 0f));

            suggestions.Add(new SuggestedSquadDto(
                squad.Id,
                squad.Name,
                squad.Criticality.Value,
                team.Count == 0 ? "Sin equipo" : $"Sin {person.Position} en el equipo",
                requiredLevel,
                allocatedFte,
                teamAvailableFte));
        }

        return suggestions;
    }

    /// <summary>El nivel que una célula exige de un cargo — 2 (Competente) si la combinación no está en la tabla. Nula la célula, mismo respaldo.</summary>
    public static int RequiredLevelFor(string? squadName, string position) =>
        squadName is not null &&
        RequiredLevelBySquadAndPosition.TryGetValue(squadName, out IReadOnlyDictionary<string, int>? byPosition) &&
        byPosition.TryGetValue(position, out int level)
            ? level
            : DefaultRequiredLevel;
}
