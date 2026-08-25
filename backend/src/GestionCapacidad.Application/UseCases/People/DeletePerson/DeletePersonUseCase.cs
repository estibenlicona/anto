using GestionCapacidad.Application.Abstractions;
using GestionCapacidad.Domain.Entities;
using GestionCapacidad.Domain.Exceptions;
using GestionCapacidad.Domain.Interfaces;

namespace GestionCapacidad.Application.UseCases.People.DeletePerson;

public sealed class DeletePersonUseCase(
    IPersonRepository personRepository,
    IUnitOfWork unitOfWork) : ICommandUseCase<DeletePersonRequest>
{
    public async Task ExecuteAsync(DeletePersonRequest request, CancellationToken cancellationToken = default)
    {
        Person? person = await personRepository.GetByIdAsync(request.Id, cancellationToken);
        if (person is null)
            throw new NotFoundException($"Person with id '{request.Id}' was not found.");

        personRepository.Delete(person);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
