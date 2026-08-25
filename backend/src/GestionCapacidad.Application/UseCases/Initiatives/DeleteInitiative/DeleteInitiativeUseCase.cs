using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Initiatives.DeleteInitiative;

public sealed class DeleteInitiativeUseCase(
    IInitiativeRepository initiativeRepository,
    IUnitOfWork unitOfWork) : ICommandUseCase<DeleteInitiativeRequest>
{
    public async Task ExecuteAsync(DeleteInitiativeRequest request, CancellationToken cancellationToken = default)
    {
        Initiative? initiative = await initiativeRepository.GetByIdAsync(request.Id, cancellationToken);
        if (initiative is null)
            throw new NotFoundException($"Initiative with id '{request.Id}' was not found.");

        initiativeRepository.Delete(initiative);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
