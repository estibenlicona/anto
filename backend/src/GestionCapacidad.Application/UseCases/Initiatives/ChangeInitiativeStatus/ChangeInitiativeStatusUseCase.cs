using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;
using GestionCapacidad.Domain.ValueObjects;

namespace GestionCapacidad.Application.UseCases.Initiatives.ChangeInitiativeStatus;

public sealed class ChangeInitiativeStatusUseCase(
    IInitiativeRepository initiativeRepository,
    IUnitOfWork unitOfWork) : ICommandUseCase<ChangeInitiativeStatusRequest>
{
    public async Task ExecuteAsync(
        ChangeInitiativeStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        var newStatus = InitiativeStatus.From(request.Status);

        Initiative? initiative = await initiativeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (initiative is null || initiative.SquadId != request.SquadId)
            throw new NotFoundException($"Initiative with id '{request.Id}' was not found in this squad.");

        // Regla de negocio: solo 1 Active por Squad
        if (newStatus.IsActive)
        {
            bool hasActiveInitiative = await initiativeRepository.HasActiveInitiativeAsync(
                request.SquadId, request.Id, cancellationToken);

            if (hasActiveInitiative)
                throw new BadRequestException(
                    "The squad already has an active initiative. Close or move the current one before activating a new one.");
        }

        initiative.ChangeStatus(newStatus);

        initiativeRepository.Update(initiative);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
