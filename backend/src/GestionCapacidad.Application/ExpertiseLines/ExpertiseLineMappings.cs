using GestionCapacidad.Application.Common;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.ExpertiseLines;

/// <summary>
/// Arma los DTOs de una línea cruzando su gente (<see cref="Person.ExpertiseLineId"/>,
/// sin tabla puente) contra sus asignaciones y células vigentes.
/// </summary>
public static class ExpertiseLineMappings
{
    public static ExpertiseLineDto ToDto(ExpertiseLine line, IReadOnlyList<Person> linePeople, Person? leadPerson) =>
        new(
            line.Id,
            line.Name,
            line.Code,
            line.Description,
            line.Status.Value,
            leadPerson is null ? null : new LineLeadDto(leadPerson.Id, leadPerson.Name),
            linePeople.Count,
            FteMath.AvailableFteOf(linePeople.Select(p => p.AvailableFte.Value)));

    public static ExpertiseLineDetailDto ToDetailDto(
        ExpertiseLine line,
        IReadOnlyList<Person> linePeople,
        Person? leadPerson,
        IReadOnlyDictionary<Guid, Allocation> allocationByPerson,
        IReadOnlyDictionary<Guid, string> squadNameById)
    {
        ExpertiseLineDto summary = ToDto(line, linePeople, leadPerson);
        List<LinePersonDto> people =
        [
            .. linePeople
                .OrderBy(p => p.Name, StringComparer.Ordinal)
                .Select(p => ToLinePersonDto(p, line.LeadId == p.Id, allocationByPerson.GetValueOrDefault(p.Id), squadNameById)),
        ];

        return new ExpertiseLineDetailDto(
            summary.Id, summary.Name, summary.Code, summary.Description, summary.Status, summary.Lead,
            summary.PeopleCount, summary.AvailableFte, people,
            LineCapacityCalculator.Compute(linePeople, allocationByPerson));
    }

    public static LinePersonDto ToLinePersonDto(
        Person person, bool isLead, Allocation? allocation, IReadOnlyDictionary<Guid, string> squadNameById) =>
        new(
            person.Id, person.Name, person.Position, person.Level.Value, person.Level.Label,
            person.AvailableFte.Value, isLead,
            allocation is null
                ? null
                : new LinePersonAllocationDto(
                    allocation.SquadId, squadNameById.GetValueOrDefault(allocation.SquadId, string.Empty),
                    allocation.DedicationPercentage.Value));

    public static RosterPersonDto ToRosterDto(Person person, ExpertiseLine? line) =>
        new(
            person.Id, person.Name, person.Position, person.Level.Value, person.Level.Label, person.AvailableFte.Value,
            line is null ? null : new LineLeadDto(line.Id, line.Name));
}
