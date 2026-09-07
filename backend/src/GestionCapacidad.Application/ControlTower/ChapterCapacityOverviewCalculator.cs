using GestionCapacidad.Application.Common;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.ControlTower;

/// <summary>
/// El resumen de la Torre de control: el FTE del chapter con las mismas
/// fórmulas de <see cref="FteMath"/> que ya usa Células, a escala de chapter
/// en vez de por célula; las personas con margen y las células, ordenadas
/// por lo que más necesita atención primero.
/// </summary>
public static class ChapterCapacityOverviewCalculator
{
    public static CapacityOverviewDto Compute(
        IReadOnlyList<Person> people,
        IReadOnlyList<Squad> squads,
        IReadOnlyList<Allocation> allocations,
        IReadOnlyList<Initiative> initiatives)
    {
        double chapterFte = FteMath.AvailableFteOf(people.Select(p => p.AvailableFte.Value));
        double bauFte = FteMath.FteOfPercentages(allocations.Select(a => a.BauPercentage.Value));
        double transformationFte = FteMath.FteOfPercentages(allocations.Select(a => a.TransformationPercentage.Value));
        double freeFte = FteMath.Round1(chapterFte - bauFte - transformationFte);

        Dictionary<Guid, Allocation> allocationByPerson = allocations
            .GroupBy(a => a.PersonId)
            .ToDictionary(g => g.Key, g => g.First());
        Dictionary<Guid, string> squadNameById = squads.ToDictionary(s => s.Id, s => s.Name);

        List<OverviewPersonDto> peopleWithMargin = [];
        int peopleUnassigned = 0;
        int peoplePartial = 0;
        foreach (Person person in people)
        {
            allocationByPerson.TryGetValue(person.Id, out Allocation? allocation);
            if (allocation is null)
            {
                peopleUnassigned++;
                peopleWithMargin.Add(new OverviewPersonDto(
                    person.Id, person.Name, person.Position, person.Level.Label, person.AvailableFte.Value, null, 100m));
            }
            else if (allocation.DedicationPercentage.Value < 100)
            {
                peoplePartial++;
                peopleWithMargin.Add(new OverviewPersonDto(
                    person.Id, person.Name, person.Position, person.Level.Label, person.AvailableFte.Value,
                    new OverviewAllocationDto(
                        allocation.Id, allocation.SquadId, squadNameById.GetValueOrDefault(allocation.SquadId, string.Empty),
                        allocation.DedicationPercentage.Value, allocation.BauPercentage.Value, allocation.TransformationPercentage.Value),
                    100m - allocation.DedicationPercentage.Value));
            }
        }

        // Sin célula primero, luego dedicación parcial por margen descendente.
        List<OverviewPersonDto> orderedPeople =
        [
            .. peopleWithMargin.Where(p => p.Allocation is null).OrderBy(p => p.Name, StringComparer.Ordinal),
            .. peopleWithMargin.Where(p => p.Allocation is not null)
                .OrderByDescending(p => p.MarginPercentage)
                .ThenBy(p => p.Name, StringComparer.Ordinal),
        ];

        SquadAggregates aggregates = SquadAggregates.Build(allocations, people, initiatives);
        List<OverviewSquadDto> squadDtos =
        [
            .. squads.Select(s =>
            {
                SquadAggregate aggregate = aggregates.For(s.Id);
                return new OverviewSquadDto(
                    s.Id, s.Name, s.Criticality.Value, aggregate.MemberCount,
                    aggregate.AllocatedFte, aggregate.PeopleAvailableFte, aggregate.BauFte, aggregate.TransformationFte);
            }),
        ];

        bool WithoutTeam(OverviewSquadDto s) => s.MemberCount == 0;
        bool AtCapacity(OverviewSquadDto s) =>
            !WithoutTeam(s) && Math.Round(s.AllocatedFte, 1) >= Math.Round(s.TeamAvailableFte, 1);

        // Sin equipo primero, luego al tope, luego el resto por menor margen.
        List<OverviewSquadDto> orderedSquads =
        [
            .. squadDtos.Where(WithoutTeam).OrderBy(s => s.Name, StringComparer.Ordinal),
            .. squadDtos.Where(AtCapacity).OrderBy(s => s.Name, StringComparer.Ordinal),
            .. squadDtos.Where(s => !WithoutTeam(s) && !AtCapacity(s))
                .OrderBy(s => Math.Round(s.TeamAvailableFte - s.AllocatedFte, 1))
                .ThenBy(s => s.Name, StringComparer.Ordinal),
        ];

        return new CapacityOverviewDto(
            chapterFte, bauFte, transformationFte, freeFte,
            people.Count, peopleUnassigned, peoplePartial,
            squadDtos.Count(AtCapacity), squadDtos.Count(WithoutTeam),
            orderedPeople, orderedSquads);
    }
}
