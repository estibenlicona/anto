using GestionCapacidad.Application.Common;
using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

/// <summary>
/// Los agregados de cada célula, derivados de las asignaciones, las personas
/// y las iniciativas vigentes. Se construye una vez por request (el mismo
/// patrón de <see cref="PersonDerivedData"/>); con la base en memoria y un
/// chapter el fetch-all alcanza — cuando llegue SQL se reescribe como
/// proyección.
/// </summary>
public sealed class SquadAggregates
{
    /// <summary>El listado muestra hasta 3 avatares; team-stats trae el equipo completo.</summary>
    public const int MemberSampleSize = 3;

    public static readonly SquadAggregate Empty = new(
        0, [], 0, 0, 0, 0, 0, 0, null);

    private readonly IReadOnlyDictionary<Guid, SquadAggregate> _bySquad;

    private SquadAggregates(IReadOnlyDictionary<Guid, SquadAggregate> bySquad) =>
        _bySquad = bySquad;

    public SquadAggregate For(Guid squadId) => _bySquad.GetValueOrDefault(squadId, Empty);

    public static SquadAggregates Build(
        IReadOnlyCollection<Allocation> allAllocations,
        IReadOnlyCollection<Person> allPeople,
        IReadOnlyCollection<Initiative> allInitiatives)
    {
        Dictionary<Guid, Person> personById = allPeople.ToDictionary(p => p.Id);

        var bySquad = new Dictionary<Guid, SquadAggregate>();
        foreach (IGrouping<Guid, Allocation> group in allAllocations.GroupBy(a => a.SquadId))
        {
            var own = group
                .Select(a => (Allocation: a, Person: personById.GetValueOrDefault(a.PersonId)))
                .Where(x => x.Person is not null)
                .Select(x => (x.Allocation, Person: x.Person!))
                .OrderBy(x => x.Person.Name, StringComparer.Ordinal)
                .ToList();

            bySquad[group.Key] = new SquadAggregate(
                MemberCount: own.Count,
                Members: own.Select(x => new SquadMemberSampleDto(x.Person.Id, x.Person.Name)).ToList(),
                ExpertCount: own.Count(x => x.Person.Level.Value == 4),
                BeginnerCount: own.Count(x => x.Person.Level.Value == 1),
                AllocatedFte: FteMath.FteOfPercentages(own.Select(x => x.Allocation.DedicationPercentage.Value)),
                BauFte: FteMath.FteOfPercentages(own.Select(x => x.Allocation.BauPercentage.Value)),
                TransformationFte: FteMath.FteOfPercentages(own.Select(x => x.Allocation.TransformationPercentage.Value)),
                PeopleAvailableFte: FteMath.AvailableFteOf(own.Select(x => x.Person.AvailableFte.Value)),
                ActiveInitiative: null);
        }

        // La iniciativa activa: una o ninguna por célula (activar una segunda
        // se rechaza). La talla sale de su evaluación guardada. Una activa sin
        // evaluar no debería existir —activarla la exige— pero si la hubiera,
        // viajaría sin talla en vez de con una inventada.
        foreach (Initiative initiative in allInitiatives.Where(i => i.Status.IsActive))
        {
            SquadAggregate current = bySquad.GetValueOrDefault(initiative.SquadId, Empty);
            bySquad[initiative.SquadId] = current with
            {
                ActiveInitiative = new SquadActiveInitiativeDto(
                    initiative.Id,
                    initiative.Name,
                    Talla: initiative.Evaluation?.Talla ?? string.Empty),
            };
        }

        return new SquadAggregates(bySquad);
    }
}

/// <summary>Los números de una célula; <c>Members</c> viene completo y ordenado por nombre.</summary>
public sealed record SquadAggregate(
    int MemberCount,
    IReadOnlyCollection<SquadMemberSampleDto> Members,
    int ExpertCount,
    int BeginnerCount,
    double AllocatedFte,
    double BauFte,
    double TransformationFte,
    double PeopleAvailableFte,
    SquadActiveInitiativeDto? ActiveInitiative);
