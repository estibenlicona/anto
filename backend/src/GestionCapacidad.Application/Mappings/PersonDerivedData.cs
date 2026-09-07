using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

/// <summary>
/// Los derivados que el DTO de persona trae calculados y no guardados: el
/// nombre del líder técnico, de cuántas personas es líder cada quien y la
/// utilización (suma de la dedicación de sus asignaciones — puede superar
/// 100). Se construye una vez por request con el total de personas y
/// asignaciones; el mapeo sólo consulta. Con la base en memoria y un chapter
/// el join en memoria alcanza; cuando llegue SQL se reescribe como consulta.
/// </summary>
public sealed class PersonDerivedData
{
    public static readonly PersonDerivedData Empty = new(
        new Dictionary<Guid, string>(),
        new Dictionary<Guid, int>(),
        new Dictionary<Guid, int>());

    private readonly IReadOnlyDictionary<Guid, string> _nameById;
    private readonly IReadOnlyDictionary<Guid, int> _leadOfCount;
    private readonly IReadOnlyDictionary<Guid, int> _utilization;

    private PersonDerivedData(
        IReadOnlyDictionary<Guid, string> nameById,
        IReadOnlyDictionary<Guid, int> leadOfCount,
        IReadOnlyDictionary<Guid, int> utilization)
    {
        _nameById = nameById;
        _leadOfCount = leadOfCount;
        _utilization = utilization;
    }

    public static PersonDerivedData Build(
        IReadOnlyCollection<Person> allPeople,
        IReadOnlyCollection<Allocation> allAllocations)
    {
        Dictionary<Guid, string> nameById = allPeople.ToDictionary(p => p.Id, p => p.Name);

        Dictionary<Guid, int> leadOfCount = allPeople
            .Where(p => p.TechnicalLeadId is not null)
            .GroupBy(p => p.TechnicalLeadId!.Value)
            .ToDictionary(g => g.Key, g => g.Count());

        Dictionary<Guid, int> utilization = allAllocations
            .GroupBy(a => a.PersonId)
            .ToDictionary(g => g.Key, g => g.Sum(a => a.DedicationPercentage.Value));

        return new PersonDerivedData(nameById, leadOfCount, utilization);
    }

    public string? TechnicalLeadNameOf(Person person) =>
        person.TechnicalLeadId is Guid leadId && _nameById.TryGetValue(leadId, out string? name)
            ? name
            : null;

    public int TechnicalLeadOfCountOf(Person person) =>
        _leadOfCount.GetValueOrDefault(person.Id);

    public int UtilizationOf(Person person) =>
        _utilization.GetValueOrDefault(person.Id);
}
