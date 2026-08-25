using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.BauTasks.DeleteBauTask;

public sealed class DeleteBauTaskUseCase(
    IBauTaskRepository bauTaskRepository,
    IUnitOfWork unitOfWork) : ICommandUseCase<DeleteBauTaskRequest>
{
    public async Task ExecuteAsync(DeleteBauTaskRequest request, CancellationToken cancellationToken = default)
    {
        BauTask? task = await bauTaskRepository.GetByIdAsync(request.TaskId, cancellationToken);
        if (task is null || task.SquadId != request.SquadId)
            throw new NotFoundException($"BAU task with id '{request.TaskId}' was not found in this squad.");

        bauTaskRepository.Delete(task);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
