using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.Teams.DeleteTeam;

public sealed class DeleteTeamUseCase(
    ITeamRepository teamRepository,
    ISquadRepository squadRepository,
    IUnitOfWork unitOfWork) : ICommandUseCase<DeleteTeamRequest>
{
    public async Task ExecuteAsync(
        DeleteTeamRequest request,
        CancellationToken cancellationToken = default)
    {
        Team? team = await teamRepository.GetByIdAsync(request.Id, cancellationToken);
        if (team is null)
        {
            throw new NotFoundException($"Team with id '{request.Id}' was not found.");
        }

        if (await squadRepository.ExistsByTeamIdAsync(team.Id, cancellationToken))
        {
            throw new ConflictException($"El equipo '{team.Name}' tiene células asociadas y no se puede eliminar.");
        }

        teamRepository.Delete(team);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
