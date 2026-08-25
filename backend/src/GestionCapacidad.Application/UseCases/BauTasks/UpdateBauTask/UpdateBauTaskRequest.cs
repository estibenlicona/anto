namespace GestionCapacidad.Application.UseCases.BauTasks.UpdateBauTask;

public sealed record UpdateBauTaskRequest(Guid SquadId, Guid TaskId, string Name);
