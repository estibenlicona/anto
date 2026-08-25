using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.BauTasks.UpdateBauTask;

public sealed class UpdateBauTaskUseCase(
    IBauTaskRepository bauTaskRepository,
    IUnitOfWork unitOfWork,
    IValidator<UpdateBauTaskRequest> validator) : IUseCase<UpdateBauTaskRequest, UpdateBauTaskResponse>
{
    public async Task<UpdateBauTaskResponse> ExecuteAsync(
        UpdateBauTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));

        BauTask? task = await bauTaskRepository.GetByIdAsync(request.TaskId, cancellationToken);
        if (task is null || task.SquadId != request.SquadId)
            throw new NotFoundException($"BAU task with id '{request.TaskId}' was not found in this squad.");

        task.Rename(request.Name);

        bauTaskRepository.Update(task);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return BauTaskMappings.ToUpdateResponse(task);
    }
}
