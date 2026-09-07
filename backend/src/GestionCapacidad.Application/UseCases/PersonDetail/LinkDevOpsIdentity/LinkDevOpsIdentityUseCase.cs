using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.PersonDetail.LinkDevOpsIdentity;

public sealed record LinkDevOpsIdentityCommand(Guid PersonId, string IdentityId);

/// <summary>
/// Vincula el identificador de Azure DevOps que el cliente ya resolvió con su
/// propia búsqueda — no valida contra Azure DevOps real, eso es del segundo
/// cambio (<c>GET /devops/users</c>).
/// </summary>
public sealed class LinkDevOpsIdentityUseCase(
    IPersonRepository personRepository,
    IUnitOfWork unitOfWork,
    TimeProvider timeProvider) : ICommandUseCase<LinkDevOpsIdentityCommand>
{
    public async Task ExecuteAsync(LinkDevOpsIdentityCommand request, CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
        {
            throw new NotFoundException("Persona no encontrada");
        }

        Person? owner = await personRepository.GetByDevOpsUserIdAsync(request.IdentityId, cancellationToken);
        if (owner is not null && owner.Id != person.Id)
        {
            throw new ConflictException($"Esa identidad ya está vinculada a {owner.Name}");
        }

        person.LinkDevOpsIdentity(request.IdentityId, timeProvider.GetUtcNow().UtcDateTime);
        personRepository.Update(person);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
