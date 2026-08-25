using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Squads.DeleteSquad;

public sealed class DeleteSquadUseCase(
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork) : ICommandUseCase<DeleteSquadRequest>
{
    public async Task ExecuteAsync(
        DeleteSquadRequest request,
        CancellationToken cancellationToken = default)
    {
        Squad? squad = await squadRepository.GetByIdAsync(request.Id, cancellationToken);
        if (squad is null)
        {
            throw new NotFoundException($"Squad with id '{request.Id}' was not found.");
        }

        squadRepository.Delete(squad);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
