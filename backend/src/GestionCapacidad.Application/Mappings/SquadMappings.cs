using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Squads.CreateSquad;
using GestionCapacidad.Application.UseCases.Squads.UpdateSquad;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

public static class SquadMappings
{
    public static SquadDto ToDto(Squad squad, SquadAggregate aggregate) =>
        new(squad.Id,
            squad.Name,
            squad.Tribe,
            squad.Criticality.Value,
            squad.Description,
            squad.CreatedAtUtc,
            squad.UpdatedAtUtc ?? squad.CreatedAtUtc,
            aggregate.MemberCount,
            aggregate.Members.Take(SquadAggregates.MemberSampleSize).ToList(),
            aggregate.AllocatedFte,
            aggregate.BauFte,
            aggregate.TransformationFte,
            aggregate.PeopleAvailableFte,
            aggregate.ActiveInitiative);

    public static CreateSquadResponse ToCreateResponse(Squad squad, SquadAggregate aggregate) =>
        new(ToDto(squad, aggregate));

    public static UpdateSquadResponse ToUpdateResponse(Squad squad, SquadAggregate aggregate) =>
        new(ToDto(squad, aggregate));
}
