using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.People.AssignPersonToProvider;

public sealed class AssignPersonToProviderUseCase(
    IPersonRepository personRepository,
    IUnitOfWork unitOfWork) : ICommandUseCase<AssignPersonToProviderRequest>
{
    public async Task ExecuteAsync(AssignPersonToProviderRequest request, CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.PersonId, cancellationToken);
        if (person is null)
            throw new NotFoundException($"Person with id '{request.PersonId}' was not found.");

        person.AssignToProvider(request.ProviderId);

        personRepository.Update(person);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
