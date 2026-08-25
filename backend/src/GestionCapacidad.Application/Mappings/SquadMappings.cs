using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Squads.CreateSquad;
using GestionCapacidad.Application.UseCases.Squads.UpdateSquad;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

public static class SquadMappings
{
    public static SquadDto ToDto(Squad squad) =>
        new(squad.Id,
            squad.Name,
            squad.Criticality.Value,
            squad.Tribe,
            squad.Description,
            squad.DevOpsBoardId,
            squad.CreatedAtUtc,
            squad.UpdatedAtUtc);

    public static CreateSquadResponse ToCreateResponse(Squad squad) =>
        new(squad.Id,
            squad.Name,
            squad.Criticality.Value,
            squad.Tribe,
            squad.Description,
            squad.CreatedAtUtc);

    public static UpdateSquadResponse ToUpdateResponse(Squad squad) =>
        new(squad.Id,
            squad.Name,
            squad.Criticality.Value,
            squad.Tribe,
            squad.Description,
            squad.CreatedAtUtc,
            squad.UpdatedAtUtc);
}
