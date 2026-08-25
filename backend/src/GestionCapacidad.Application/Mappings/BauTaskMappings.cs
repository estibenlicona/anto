using GestionCapacidad.Application.DataTransferObjects;
using GestionCapacidad.Application.UseCases.BauTasks.CreateBauTask;
using GestionCapacidad.Application.UseCases.BauTasks.UpdateBauTask;
using GestionCapacidad.Domain.Entities;

namespace GestionCapacidad.Application.Mappings;

public static class BauTaskMappings
{
    public static BauTaskDto ToDto(BauTask task) =>
        new(task.Id, task.SquadId, task.Name, task.CreatedAtUtc, task.UpdatedAtUtc);

    public static CreateBauTaskResponse ToCreateResponse(BauTask task) => new(ToDto(task));

    public static UpdateBauTaskResponse ToUpdateResponse(BauTask task) => new(ToDto(task));
}
