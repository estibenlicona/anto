using GestionCapacidad.Application.Common;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.Absences;

/// <summary>
/// Lo que hace falta para responder una ausencia y que la ausencia sola no
/// sabe: de quién es, de qué proveedor viene, y cuánta capacidad le quita a
/// cada célula de esa persona en el mes que se pregunta.
///
/// Se construye una vez por request desde el conjunto completo, como
/// <c>SquadAggregates</c> e <c>InitiativeContext</c>. Nada de esto se
/// persiste: el impacto depende del mes preguntado y de una dedicación que
/// cambia sin que la ausencia cambie.
/// </summary>
public sealed class AbsenceContext
{
    private readonly IReadOnlyDictionary<Guid, Person> _peopleById;
    private readonly IReadOnlyDictionary<Guid, string> _providerNameById;
    private readonly ILookup<Guid, (Guid SquadId, string SquadName, int DedicationPct)> _sharesByPerson;

    private AbsenceContext(
        IReadOnlyDictionary<Guid, Person> peopleById,
        IReadOnlyDictionary<Guid, string> providerNameById,
        ILookup<Guid, (Guid SquadId, string SquadName, int DedicationPct)> sharesByPerson)
    {
        _peopleById = peopleById;
        _providerNameById = providerNameById;
        _sharesByPerson = sharesByPerson;
    }

    public static async Task<AbsenceContext> BuildAsync(
        IPersonRepository people,
        ICompanyRepository companies,
        IAllocationRepository allocations,
        ISquadRepository squads,
        CancellationToken cancellationToken)
    {
        IReadOnlyList<Person> allPeople = await people.GetAllAsync(cancellationToken);
        IReadOnlyList<Company> allCompanies = await companies.GetAllAsync(cancellationToken);
        IReadOnlyList<Allocation> allAllocations = await allocations.GetAllAsync(cancellationToken);
        IReadOnlyList<Squad> allSquads = await squads.GetAllAsync(cancellationToken);

        Dictionary<Guid, string> squadNames = allSquads.ToDictionary(s => s.Id, s => s.Name);

        ILookup<Guid, (Guid, string, int)> shares = allAllocations
            .ToLookup(
                a => a.PersonId,
                a => (a.SquadId, squadNames.GetValueOrDefault(a.SquadId, string.Empty), a.DedicationPercentage.Value));

        return new AbsenceContext(
            allPeople.ToDictionary(p => p.Id),
            allCompanies.ToDictionary(c => c.Id, c => c.Name),
            shares);
    }

    public bool PersonExists(Guid personId) => _peopleById.ContainsKey(personId);

    /// <summary>
    /// La ausencia contra un mes concreto. Los días del rango completo son los
    /// mismos siempre; los del mes y los impactos cambian con el mes pedido.
    /// </summary>
    public AbsenceDto ToDto(Absence absence, DateOnly monthStart, DateOnly monthEnd)
    {
        Person? person = _peopleById.GetValueOrDefault(absence.PersonId);

        decimal monthBusinessDays = BusinessDayMath.CountBusinessDays(monthStart, monthEnd);
        decimal businessDaysInMonth = BusinessDayMath.BusinessDaysInMonth(
            absence.StartDate, absence.EndDate,
            absence.StartsHalfDay, absence.EndsHalfDay,
            monthStart, monthEnd);

        return new AbsenceDto(
            absence.Id,
            absence.PersonId,
            // Una persona borrada deja la ausencia sin nombre en vez de romper
            // la respuesta del mes entero.
            person?.Name ?? string.Empty,
            ProviderNameOf(person),
            absence.Type.Value,
            absence.StartDate,
            absence.EndDate,
            absence.StartsHalfDay,
            absence.EndsHalfDay,
            BusinessDayMath.CountBusinessDays(
                absence.StartDate, absence.EndDate, absence.StartsHalfDay, absence.EndsHalfDay),
            absence.Status.Value,
            absence.RejectReason,
            businessDaysInMonth,
            ImpactsOf(absence.PersonId, person, businessDaysInMonth, monthBusinessDays));
    }

    /// <summary>Nulo cuando la persona es de planta: no hay proveedor que nombrar.</summary>
    private string? ProviderNameOf(Person? person) =>
        person?.ProviderId is Guid providerId ? _providerNameById.GetValueOrDefault(providerId) : null;

    /// <summary>
    /// El impacto se reparte entre las células de la persona en proporción a
    /// su dedicación: días ausentes del mes ÷ días hábiles del mes × FTE
    /// disponible × dedicación. Sin células no hay impacto que repartir, y la
    /// lista sale vacía en vez de con un cero contra una célula inventada.
    /// </summary>
    private IReadOnlyList<AbsenceSquadImpactDto> ImpactsOf(
        Guid personId,
        Person? person,
        decimal businessDaysInMonth,
        decimal monthBusinessDays)
    {
        decimal availableFte = person is null ? 0m : (decimal)person.AvailableFte.Value;
        decimal monthShare = monthBusinessDays > 0m && businessDaysInMonth > 0m
            ? businessDaysInMonth / monthBusinessDays
            : 0m;

        return
        [
            .. _sharesByPerson[personId]
                .OrderByDescending(share => share.DedicationPct)
                .ThenBy(share => share.SquadName, StringComparer.Ordinal)
                .Select(share => new AbsenceSquadImpactDto(
                    share.SquadId,
                    share.SquadName,
                    share.DedicationPct,
                    monthShare * availableFte * (share.DedicationPct / 100m))),
        ];
    }
}
