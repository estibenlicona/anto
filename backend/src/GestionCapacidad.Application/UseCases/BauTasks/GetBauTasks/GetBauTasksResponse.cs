using GestionCapacidad.Application.DataTransferObjects;

namespace GestionCapacidad.Application.UseCases.BauTasks.GetBauTasks;

public sealed record GetBauTasksResponse(IReadOnlyList<BauTaskDto> Tasks);
