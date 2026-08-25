using FluentValidation;
using FluentValidation.Results;
using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Application.Mappings;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

using DomainValidationException = GestionCapacidad.Domain.Exceptions.ValidationException;

namespace GestionCapacidad.Application.UseCases.BauTasks.CreateBauTask;

public sealed class CreateBauTaskUseCase(
    IBauTaskRepository bauTaskRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreateBauTaskRequest> validator) : IUseCase<CreateBauTaskRequest, CreateBauTaskResponse>
{
    public async Task<CreateBauTaskResponse> ExecuteAsync(
        CreateBauTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidationResult validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
            throw new DomainValidationException(validationResult.Errors.Select(e => e.ErrorMessage));

        Squad? squad = await squadRepository.GetByIdAsync(request.SquadId, cancellationToken);
        if (squad is null)
            throw new NotFoundException($"Squad with id '{request.SquadId}' was not found.");

        if (await bauTaskRepository.ExistsByNameInSquadAsync(request.SquadId, request.Name, cancellationToken))
            throw new BadRequestException($"A BAU task named '{request.Name}' already exists in this squad.");

        var task = new BauTask(request.SquadId, request.Name);

        await bauTaskRepository.AddAsync(task, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return BauTaskMappings.ToCreateResponse(task);
    }
}
