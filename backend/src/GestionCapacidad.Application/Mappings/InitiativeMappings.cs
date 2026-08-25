using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.Initiatives.CreateInitiative;
using GestionCapacidad.Application.UseCases.Initiatives.UpdateInitiative;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

public static class InitiativeMappings
{
    public static InitiativeDto ToDto(Initiative initiative) =>
        new(initiative.Id,
            initiative.SquadId,
            initiative.Name,
            initiative.Type.Value,
            initiative.Status.Value,
            initiative.DeadlineMonths,
            initiative.BacklogDefined,
            initiative.ArchitectureDefined,
            initiative.EarlyStageCompleted,
            initiative.CreatedAtUtc,
            initiative.UpdatedAtUtc);

    public static CreateInitiativeResponse ToCreateResponse(Initiative initiative) => new(ToDto(initiative));

    public static UpdateInitiativeResponse ToUpdateResponse(Initiative initiative) => new(ToDto(initiative));
}
